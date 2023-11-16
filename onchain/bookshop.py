from pyteal import *


class Product:
    class Variables:
        name = Bytes("NAME")

        book_id = Bytes("BOOKID")

        image = Bytes("IMAGE")

        price = Bytes("PRICE")

        sold = Bytes("SOLD")
        address = Bytes("ADDRESS")
        owner = Bytes("OWNER")

    class AppMethods:
        buy = Bytes("buy")

    def application_creation(self):
        return Seq(
            [
                Assert(Txn.application_args.length() == Int(4)),
                Assert(Txn.note() == Bytes("bookshop-marketplace:uv1")),
                Assert(Btoi(Txn.application_args[3]) > Int(0)),
                App.globalPut(self.Variables.name, Txn.application_args[0]),
                App.globalPut(self.Variables.book_id, Txn.application_args[1]),
                App.globalPut(self.Variables.image, Txn.application_args[2]),
                App.globalPut(self.Variables.price, Btoi(Txn.application_args[3])),
                App.globalPut(self.Variables.sold, Int(0)),
                App.globalPut(self.Variables.address, Global.creator_address()),
                App.globalPut(self.Variables.owner, Txn.sender()),
                Approve(),
            ]
        )

    # Handler for the buy interaction
    # Buying a product is represented as a group transaction where a smart contract
    # call transaction and a payment transaction to the product owner are grouped together.
    def buy(self):
        count = Txn.application_args[1]

        valid_number_of_transactions = Global.group_size() == Int(2)

        valid_payment_to_seller = And(
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.creator_address(),
            Gtxn[1].amount() == App.globalGet(self.Variables.price) * Btoi(count),
            Gtxn[1].sender() == Gtxn[0].sender(),
        )

        can_buy = And(valid_number_of_transactions, valid_payment_to_seller)

        update_state = Seq(
            [
                App.globalPut(
                    self.Variables.sold,
                    App.globalGet(self.Variables.sold) + Btoi(count),
                ),
                Approve(),
            ]
        )

        return If(can_buy).Then(update_state).Else(Reject())

    # To be able to delete the product
    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    # Check transaction conditions
    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [
                Txn.on_completion() == OnComplete.DeleteApplication,
                self.application_deletion(),
            ],
            [Txn.application_args[0] == self.AppMethods.buy, self.buy()],
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
