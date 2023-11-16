import algosdk from "algosdk";
import {
    algodClient,
    indexerClient,
    bookAppNote,
    minRound,
    myAlgoConnect,
    numGlobalBytes,
    numGlobalInts,
    numLocalBytes,
    numLocalInts
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/bookshop_approval.teal";
import clearProgram from "!!raw-loader!../contracts/bookshop_clear.teal";
import { base64ToUTF8String, utf8ToBase64String } from "./conversions";
import { getServerAuthSession } from "@/server/auth";
global.Buffer = global.Buffer || require('buffer').Buffer

const ALGO_PER_DOLLAR = 0.14;

export class Book {
    name: string
    image: string
    price: number
    sold: boolean
    appId: number
    owner: string
    book_id: string

    constructor(name: string, image: string, price: number, sold: boolean, appId: number, owner: string, book_id: string) {
        this.name = name;
        this.image = image;
        this.price = price;
        this.sold = sold;
        this.appId = appId;
        this.book_id = book_id
        this.owner = owner;
    }
}

export async function fetchBalance() {
    const session = await getServerAuthSession();
    const user = session?.user;

    try {
        const acctInfo = await algodClient.accountInformation(user?.walletAddress).do();
        const balance = acctInfo.amount;
        return balance;
    } catch(err) {
        throw Error("Could Not Get Balance")
    }
}

// Compile smart contract in .teal format to program
const compileProgram = async (programSource) => {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algodClient.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}

// CREATE PRODUCT: ApplicationCreateTxn
export const createProductAction = async (senderAddress: string, book: Book, privateKey: Uint8Array) => {
    console.log("Adding book...")

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    // Compile programs
    const compiledApprovalProgram = await compileProgram(approvalProgram)
    const compiledClearProgram = await compileProgram(clearProgram)

    // Build note to identify transaction later and required app args as Uint8Arrays
    let note = new TextEncoder().encode(bookAppNote);
    let name = new TextEncoder().encode(book.name);
    let image = new TextEncoder().encode(book.image);
    let book_id = new TextEncoder().encode(book.book_id);
    let price = algosdk.encodeUint64(book.price);

    let appArgs = [name, book_id, image, price]

    // Create ApplicationCreateTxn
    let txn = algosdk.makeApplicationCreateTxnFromObject({
        from: senderAddress,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: compiledApprovalProgram,
        clearProgram: compiledClearProgram,
        numLocalInts: numLocalInts,
        numLocalByteSlices: numLocalBytes,
        numGlobalInts: numGlobalInts,
        numGlobalByteSlices: numGlobalBytes,
        note: note,
        appArgs: appArgs
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    // let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    const signedTxn = txn.signTxn(privateKey);
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // Get created application id and notify about completion
    let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['application-index'];
    console.log("Created new app-id: ", appId);
    return appId;
}

// BUY PRODUCT: Group transaction consisting of ApplicationCallTxn and PaymentTxn
export const buyProductAction = async (senderAddress: string, book: Book, privateKey: Uint8Array) => {
    console.log("Buying book...");

    console.log(1);
    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    console.log(2);
    // Build required app args as Uint8Array
    let buyArg = new TextEncoder().encode("buy")
    let appArgs = [buyArg]

    console.log(3);
    // Create ApplicationCallTxn
    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: book.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: appArgs
    })

    console.log(4);
    // Create PaymentTxn
    let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: book.owner,
        amount: book.price,
        suggestedParams: params
    })

    let txnArray = [appCallTxn, paymentTxn]

    console.log(5);
    // Create group transaction out of previously build transactions
    let groupID = algosdk.computeGroupID(txnArray)
    for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

    console.log(6);
    // Sign & submit the group transaction
    // let signedTxn = await myAlgoConnect.signTransaction(txnArray.map(txn => txn.toByte()));
    const signedTxn = txnArray.map(txn => txn.signTxn(privateKey))
    console.log("Signed group transaction");
    let tx = await algodClient.sendRawTransaction(signedTxn.map(txn => txn)).do();

    console.log(7);
    // Wait for group transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);

    // Notify about completion
    console.log("Group transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
}

// GET PRODUCTS: Use indexer
export const getBooksAction = async () => {
    console.log("Fetching books...")
    console.log(1);
    let note = new TextEncoder().encode(bookAppNote);
    let encodedNote = Buffer.from(note).toString("base64");

    console.log(2);
    // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
    let transactionInfo = await indexerClient.searchForTransactions()
        .notePrefix(encodedNote)
        .txType("appl")
        .minRound(Number.MAX_SAFE_INTEGER)
        .do();
    let books = []
    console.log("Transactions are:")
    console.log(transactionInfo);
    for (const transaction of transactionInfo.transactions) {
        console.log(3);
        let appId = transaction["created-application-index"]
        if (appId) {
            console.log(4);
            // Step 2: Get each application by application id
            let book = await getApplication(appId)
            if (book) {
                console.log(5);
                books.push(book)
            }
        }
    }
    console.log("Books fetched.")
    return books
}

export async function payForBook(senderAddress: string, ownerAddress: string, price: number, senderPrivateKey?: Uint8Array) {
    try {

        if (senderPrivateKey == null) {
            throw Error("Deencrypt Password")
        }

        const acctInfo = await algodClient.accountInformation(senderAddress).do();
        console.log(`Account balance: ${acctInfo.amount} microAlgos`);

        if (acctInfo.amount < price * 1_000_000) {
            throw Error("Insufficient Funds");
        }

        const suggestedParams = await algodClient.getTransactionParams().do();
        const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: senderAddress,
            suggestedParams,
            to: ownerAddress,
            amount: price * 1_000_000,
            note: new Uint8Array(Buffer.from('hello world')),
        });

        const signedTxn = ptxn.signTxn(senderPrivateKey);

        const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
        const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
        console.log(result);
        console.log(`Transaction Information: ${result.txn}`);
        console.log(`Decoded Note: ${Buffer.from(result.txn.txn.note).toString()}`);
    } catch (err) {
        throw "Could Not Pay For Book"
    }
}

const getApplication = async (appId: number) => {
    try {
        console.log(6);
        // 1. Get application by appId
        let response = await indexerClient.lookupApplications(appId).includeAll(true).do();
        if (response.application.deleted) {
            return null;
        }
        let globalState = response.application.params["global-state"]

        // 2. Parse fields of response and return product
        let owner = response.application.params.creator
        let name = ""
        let image = ""
        let book_id = ""
        let price = 0
        let sold = 0
        let isSold = false;

        console.log(7);
        const getField = (fieldName: string, globalState) => {
            return globalState.find(state => {
                return state.key === utf8ToBase64String(fieldName);
            })
        }

        if (getField("NAME", globalState) !== undefined) {
            console.log(8);
            let field = getField("NAME", globalState).value.bytes
            name = base64ToUTF8String(field)
        }

        if (getField("IMAGE", globalState) !== undefined) {
            console.log(9);
            let field = getField("IMAGE", globalState).value.bytes
            image = base64ToUTF8String(field)
        }

        if (getField("BOOK_ID", globalState) !== undefined) {
            console.log(10);
            let field = getField("BOOK_ID", globalState).value.bytes
            book_id = base64ToUTF8String(field)
        }

        if (getField("PRICE", globalState) !== undefined) {
            console.log(11);
            price = getField("PRICE", globalState).value.uint
        }

        if (getField("SOLD", globalState) !== undefined) {
            console.log(12);
            sold = getField("SOLD", globalState).value.uint
            isSold = sold != 0
        }

        console.log(13);
        return new Book(name, image, price, isSold, appId, owner, book_id)
    } catch (err) {
        return null;
    }
}