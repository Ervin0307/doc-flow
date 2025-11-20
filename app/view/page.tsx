'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Layers, ChevronDown, Download, GripVertical, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Document, Page, pdfjs } from 'react-pdf'
import * as Accordion from '@radix-ui/react-accordion'
import * as Select from '@radix-ui/react-select'
import { ModeToggle } from '@/components/mode-toggle'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type ContentType = 'text' | 'table' | 'image'

interface DocumentNode {
  content: string[]
  children: Record<string, DocumentNode>
  contentType?: ContentType // Classification for this node
}

const dummyJsonStructure: Record<string, DocumentNode> = {
  "Abstract": {
    "content": [
      "This paper presents a comprehensive analysis of hierarchical document structures and their applications in modern information systems.",
      "We explore various parsing techniques and their effectiveness in extracting semantic meaning from complex documents."
    ],
    "contentType": "text",
    "children": {}
  },
  "1. Introduction": {
    "content": [
      "Document structure analysis has become increasingly important in the digital age.",
      "The ability to automatically parse and understand document hierarchies enables better information retrieval and knowledge management."
    ],
    "contentType": "text",
    "children": {
      "1.1 Background": {
        "content": [
          "Traditional document processing relied heavily on manual annotation and classification.",
          "Recent advances in natural language processing have opened new possibilities for automated structure extraction."
        ],
        "contentType": "text",
        "children": {}
      },
      "1.2 Motivation": {
        "content": [
          "The exponential growth of digital documents necessitates scalable parsing solutions.",
          "Hierarchical representations provide intuitive navigation and improved comprehension."
        ],
        "contentType": "text",
        "children": {
          "Table 1: Performance Metrics": {
            "content": [
              "| Metric | Value | Benchmark |",
              "| Precision | 0.92 | 0.85 |",
              "| Recall | 0.89 | 0.82 |"
            ],
            "contentType": "table",
            "children": {}
          }
        }
      }
    }
  },
  "2. Methodology": {
    "content": [
      "Our approach combines multiple techniques to achieve robust document parsing.",
      "We leverage both rule-based and machine learning methods for optimal results."
    ],
    "contentType": "text",
    "children": {
      "2.1 PDF Conversion": {
        "content": [
          "We utilize marker-pdf for initial conversion to Markdown format.",
          "This step preserves structural information while simplifying subsequent processing."
        ],
        "contentType": "text",
        "children": {
          "2.1.1 Preprocessing": {
            "content": [
              "Documents undergo cleaning to remove artifacts and normalize formatting.",
              "Special attention is paid to handling tables, figures, and mathematical notation."
            ],
            "contentType": "text",
            "children": {}
          },
          "Figure 1: System Architecture": {
            "content": [
              "[Diagram showing the multi-stage document processing pipeline]"
            ],
            "contentType": "image",
            "children": {}
          }
        }
      },
      "2.2 Structure Extraction": {
        "content": [
          "Table of contents generation uses pdfminer for accurate heading detection.",
          "Hierarchical relationships are established through heading level analysis."
        ],
        "contentType": "text",
        "children": {
          "Table 2: Processing Times": {
            "content": [
              "| Document Type | Avg Time (s) |",
              "| Research Paper | 2.3 |",
              "| Technical Report | 3.1 |"
            ],
            "contentType": "table",
            "children": {}
          }
        }
      },
      "2.3 Node Creation": {
        "content": [
          "A recursive tree structure is built to represent the document hierarchy.",
          "Each node contains content and references to its children."
        ],
        "contentType": "text",
        "children": {}
      }
    }
  },
  "3. Results": {
    "content": [
      "Our system successfully parsed 95% of test documents with high accuracy.",
      "Performance metrics demonstrate significant improvements over baseline methods."
    ],
    "contentType": "text",
    "children": {
      "3.1 Quantitative Analysis": {
        "content": [
          "Precision and recall scores exceeded 0.90 across all document types.",
          "Processing time averaged 2.3 seconds per document."
        ],
        "contentType": "text",
        "children": {}
      },
      "Figure 2: Results Comparison": {
        "content": [
          "[Bar chart comparing our method with baseline approaches]"
        ],
        "contentType": "image",
        "children": {}
      },
      "3.2 Qualitative Evaluation": {
        "content": [
          "User studies indicated high satisfaction with the hierarchical representation.",
          "Navigation efficiency improved by 40% compared to traditional linear views."
        ],
        "contentType": "text",
        "children": {}
      }
    }
  },
  "4. Conclusion": {
    "content": [
      "We have demonstrated an effective approach to hierarchical document parsing.",
      "Future work will focus on handling more complex document types and multilingual support."
    ],
    "contentType": "text",
    "children": {}
  }
}

export default function ViewPage() {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const pdfContainerRef = useRef<HTMLDivElement>(null)
  const jsonContainerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [leftWidth, setLeftWidth] = useState(50)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [contentFilter, setContentFilter] = useState<'all' | ContentType>('all')

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(dummyJsonStructure, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'document-structure.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      // Constrain between 20% and 80%
      if (newLeftWidth >= 20 && newLeftWidth <= 80) {
        setLeftWidth(newLeftWidth)
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  useEffect(() => {
    const pdfContainer = pdfContainerRef.current
    const jsonContainer = jsonContainerRef.current

    if (!pdfContainer || !jsonContainer) return

    let scrollTimeout: NodeJS.Timeout

    const handlePdfScroll = () => {
      if (isScrolling) return
      setIsScrolling(true)

      const pdfScrollPercentage = pdfContainer.scrollTop / (pdfContainer.scrollHeight - pdfContainer.clientHeight)
      const jsonScrollTarget = pdfScrollPercentage * (jsonContainer.scrollHeight - jsonContainer.clientHeight)
      
      jsonContainer.scrollTop = jsonScrollTarget

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150)
    }

    const handleJsonScroll = () => {
      if (isScrolling) return
      setIsScrolling(true)

      const jsonScrollPercentage = jsonContainer.scrollTop / (jsonContainer.scrollHeight - jsonContainer.clientHeight)
      const pdfScrollTarget = jsonScrollPercentage * (pdfContainer.scrollHeight - pdfContainer.clientHeight)
      
      pdfContainer.scrollTop = pdfScrollTarget

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150)
    }

    pdfContainer.addEventListener('scroll', handlePdfScroll)
    jsonContainer.addEventListener('scroll', handleJsonScroll)

    return () => {
      pdfContainer.removeEventListener('scroll', handlePdfScroll)
      jsonContainer.removeEventListener('scroll', handleJsonScroll)
      clearTimeout(scrollTimeout)
    }
  }, [isScrolling])

  const nodeMatchesFilter = (node: DocumentNode, filter: 'all' | ContentType): boolean => {
    if (filter === 'all') return true
    
    // Check current node
    if (node.contentType === filter) return true
    
    // Check children recursively
    return Object.values(node.children).some(child => nodeMatchesFilter(child, filter))
  }

  const getFilteredData = () => {
    if (contentFilter === 'all') return dummyJsonStructure
    
    const filtered: Record<string, DocumentNode> = {}
    Object.entries(dummyJsonStructure).forEach(([key, value]) => {
      if (nodeMatchesFilter(value, contentFilter)) {
        filtered[key] = value
      }
    })
    return filtered
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-background px-6 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-border mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Layers className="w-3 h-3 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Document Viewer</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <ModeToggle />
           <Button 
             onClick={handleExport}
             variant="outline" 
             size="sm" 
             className="h-8 text-xs border-border bg-secondary/50 hover:bg-secondary"
           >
             <Download className="w-3 h-3 mr-1.5" />
             Export JSON
           </Button>
           <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
             Share
           </Button>
        </div>
      </header>

      {/* Split View Container */}
      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        {/* Left Panel - JSON Structure */}
        <div 
          className="bg-background overflow-auto" 
          ref={jsonContainerRef}
          style={{ width: `${leftWidth}%` }}
        >
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-2 flex items-center justify-between">
             <span className="text-xs font-mono text-muted-foreground">STRUCTURED DATA</span>
             <Select.Root value={contentFilter} onValueChange={(value: any) => setContentFilter(value)}>
               <Select.Trigger className="flex items-center gap-2 px-3 py-1.5 text-xs border border-border rounded-md hover:bg-secondary transition-colors">
                 <Filter className="w-3 h-3" />
                 <Select.Value />
                 <ChevronDown className="w-3 h-3 ml-1" />
               </Select.Trigger>
               <Select.Portal>
                 <Select.Content className="bg-background border border-border rounded-md shadow-lg overflow-hidden z-50">
                   <Select.Viewport>
                     <Select.Item value="all" className="px-3 py-2 text-xs hover:bg-secondary cursor-pointer outline-none">
                       <Select.ItemText>All</Select.ItemText>
                     </Select.Item>
                     <Select.Item value="text" className="px-3 py-2 text-xs hover:bg-secondary cursor-pointer outline-none">
                       <Select.ItemText>Text</Select.ItemText>
                     </Select.Item>
                     <Select.Item value="table" className="px-3 py-2 text-xs hover:bg-secondary cursor-pointer outline-none">
                       <Select.ItemText>Table</Select.ItemText>
                     </Select.Item>
                     <Select.Item value="image" className="px-3 py-2 text-xs hover:bg-secondary cursor-pointer outline-none">
                       <Select.ItemText>Image</Select.ItemText>
                     </Select.Item>
                   </Select.Viewport>
                 </Select.Content>
               </Select.Portal>
             </Select.Root>
          </div>
          <div className="p-6">
            <JsonAccordion data={getFilteredData()} filter={contentFilter} />
          </div>
        </div>

        {/* Draggable Divider */}
        <div 
          className="w-1 bg-border hover:bg-primary cursor-col-resize relative group flex-shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="w-6 h-12 bg-secondary border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Right Panel - PDF Viewer */}
        <div 
          className="border-l border-border bg-secondary/20 overflow-auto relative" 
          ref={pdfContainerRef}
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-2 flex justify-between items-center">
             <span className="text-xs font-mono text-muted-foreground">SOURCE PDF</span>
             <span className="text-xs font-mono text-muted-foreground">{pageNumber} / {numPages}</span>
          </div>
          <div className="p-8 flex justify-center min-h-full">
            <div className="shadow-2xl">
              <Document
                file="https://arxiv.org/pdf/1706.03762.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-96 w-full">
                    <div className="text-muted-foreground text-sm animate-pulse">Loading Document...</div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-96 w-full">
                    <div className="text-destructive text-sm">Failed to load PDF</div>
                  </div>
                }
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="mb-8 shadow-lg"
                    width={600}
                  />
                ))}
              </Document>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function JsonAccordion({ data, depth = 0, filter }: { data: Record<string, DocumentNode>; depth?: number; filter: 'all' | ContentType }) {
  // Define color schemes for each level (up to 5 levels)
  const levelColors = [
    { 
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      border: 'border-blue-500/30 dark:border-blue-500/40',
      hover: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/30',
      dot: 'bg-blue-500',
      text: 'group-hover:text-blue-500'
    },
    { 
      bg: 'bg-violet-500/10 dark:bg-violet-500/20',
      border: 'border-violet-500/30 dark:border-violet-500/40',
      hover: 'hover:bg-violet-500/20 dark:hover:bg-violet-500/30',
      dot: 'bg-violet-500',
      text: 'group-hover:text-violet-500'
    },
    { 
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      border: 'border-emerald-500/30 dark:border-emerald-500/40',
      hover: 'hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30',
      dot: 'bg-emerald-500',
      text: 'group-hover:text-emerald-500'
    },
    { 
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      border: 'border-amber-500/30 dark:border-amber-500/40',
      hover: 'hover:bg-amber-500/20 dark:hover:bg-amber-500/30',
      dot: 'bg-amber-500',
      text: 'group-hover:text-amber-500'
    },
    { 
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      border: 'border-rose-500/30 dark:border-rose-500/40',
      hover: 'hover:bg-rose-500/20 dark:hover:bg-rose-500/30',
      dot: 'bg-rose-500',
      text: 'group-hover:text-rose-500'
    }
  ]

  const colors = levelColors[depth % levelColors.length]

  const getTagStyles = (type?: ContentType) => {
    switch (type) {
      case 'text':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30'
      case 'table':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      case 'image':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className={depth > 0 ? 'ml-4 pl-4 border-l border-border/50 mt-2' : ''}>
      {Object.entries(data).map(([key, value]: [string, DocumentNode]) => {
        const isVisible = filter === 'all' || value.contentType === filter || 
                         Object.values(value.children).some(child => nodeMatchesFilter(child, filter))
        
        if (!isVisible) return null

        const hasChildren = value.children && Object.keys(value.children).length > 0
        const hasContent = value.content && value.content.length > 0

        return (
          <Accordion.Root key={key} type="single" collapsible className="mb-2">
            <Accordion.Item value={key} className={`border ${colors.border} rounded-lg ${colors.bg} overflow-hidden transition-all`}>
              <Accordion.Header>
                <Accordion.Trigger className={`flex items-center justify-between w-full px-4 py-3 text-left ${colors.hover} transition-colors group`}>
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-2 h-2 rounded-full ${colors.dot} transition-transform group-data-[state=open]:scale-125`}></div>
                    <span className={`font-mono text-sm font-medium text-foreground ${colors.text} transition-colors`}>
                      {key}
                    </span>
                    {value.contentType && (
                      <span className={`ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full border ${getTagStyles(value.contentType)}`}>
                        {value.contentType.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-4 pb-4 pt-2 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                {hasContent && (
                  <div className="space-y-2 mb-4 pl-4">
                    {value.content.map((line: string, idx: number) => (
                      <p key={idx} className="text-sm text-muted-foreground leading-relaxed font-mono">
                        "{line}"
                      </p>
                    ))}
                  </div>
                )}
                {hasChildren && <JsonAccordion data={value.children} depth={depth + 1} filter={filter} />}
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        )
      })}
    </div>
  )
}

function nodeMatchesFilter(node: DocumentNode, filter: 'all' | ContentType): boolean {
  if (filter === 'all') return true
  if (node.contentType === filter) return true
  return Object.values(node.children).some(child => nodeMatchesFilter(child, filter))
}
