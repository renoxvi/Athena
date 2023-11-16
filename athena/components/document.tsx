"use client"
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();


import React, { useState } from 'react'
import { Publication } from '@prisma/client';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import BackButton from './back-button';

interface Props {
    publication: Publication | null
}

function DocumentSection(props: Props) {
    const { publication } = props 
    const [currentPage, setCurrentPage] = useState(1)
    const onLoad = () => {
        console.log("loading complete")
    }

    const prev = () => {
      setCurrentPage(p => p - 1)
    }
    
    const next = () => {
      setCurrentPage(p => p + 1)
    }
  return (
    <>
      <div className="flex flex-row items-center justify-start w-full mb-5">
        <BackButton/>
      </div>
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 py-10">
          <div className="w-4/5 h-full items-center justify-start ring-1 ring-amber-300 shadow-md rounded-md bg-white">
              <Document file={publication?.file_url} onLoadSuccess={onLoad} >
                  <Page pageNumber={currentPage} />
              </Document>
              <div className="flex flex-row items-center justify-center">
                  <div className="flex flex-row items-center gap-x-2 py-5">
                    <Button disabled={currentPage <= 1} variant={'ghost'} onClick={prev} className="flex flex-row items-center justify-center px-2 py-1 rounded-full ">
                      <ArrowLeft fontSize={16} />
                    </Button>
                    <div className="flex flex-row items-center">
                      {currentPage} / {publication?.pages}
                    </div>
                    <Button disabled={currentPage >= (publication?.pages ?? 0)} variant={'ghost'} onClick={next} className="flex flex-row items-center justify-center px-2 py-1 rounded-full ">
                      <ArrowRight fontSize={16} />
                    </Button>
                  </div>
              </div>
          </div>
      </div>
    </>
  )
}

export default DocumentSection