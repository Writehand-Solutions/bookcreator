import React from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const PrintBookButton = ({chapters, title}) => {

    function convertMathInParagraphs(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Find all <li> elements
        const listItems = doc.getElementsByTagName('li');

        // Loop through <li> elements
        Array.from(listItems).forEach(li => {

            if(li.querySelector('code.hljs')) return; // prevent formatting on code block

            // Check if <li> contains any <p> with math
            const paragraphs = li.getElementsByTagName('p');
            let hasMathInParagraph = false;
            
            // Check each <p> for math expressions
            Array.from(paragraphs).forEach(p => {
                if (/\(([^()]+)\)/.test(p.innerHTML) || /\[([^\]]+)\]/.test(p.innerHTML)) {
                    hasMathInParagraph = true;
                }
            });

            // If it contains <p> with math, skip processing this <li>
            if (!hasMathInParagraph) {
                // Process inline math inside parentheses ( ... )
                // First replacement for complex nested parentheses
                li.innerHTML = li.innerHTML.replace(/\(([^()]*\([^()]*\)[^()]*)\)/g, (_, mathExpr) => {
                    // Check if it contains valid math characters
                    if (/[\d\w\\\times\text]/.test(mathExpr)) {
                        return `\\(${mathExpr.trim()}\\)`; // Wrap inline math in MathJax delimiters
                    }
                    return `(${mathExpr})`; // Return unmodified if it's regular text
                });
            }
        });

        // Process all <p> elements for math
        const paragraphs = doc.getElementsByTagName('p');
        Array.from(paragraphs).forEach(p => {

            let hasBlock = p.innerHTML.indexOf('$$')>=0;

            if(p.querySelector('code.hljs')) return; // prevent formatting on code block

            // Adjusted regex to match nested parentheses
            if(!hasBlock) p.innerHTML = p.innerHTML.replace(/\(([^()]*?\([^()]*?\)[^()]*?)\)/g, (_, mathExpr) => {
                // Check for valid math expression
                if (/[\d\w\\\times\text]/.test(mathExpr)) {
                    return `\\(${mathExpr.trim()}\\)`; // Wrap inline math in MathJax delimiters
                }
                return `(${mathExpr})`;
            });
        });
      
        return doc.body.innerHTML;
    }

    function handlePrint() {
        let combinedHtml = '';
        let titlesHtml = '';

        chapters.forEach((chapter, index) => {
            titlesHtml += `<li><a href="#chapter${index + 1}">${chapter.title}</a></li>`;

            // let chapterHtml = chapter.html.replace(/<h2(.*?)>/g, (match, p1) => `<h2${p1} id="chapter${index + 1}">`);
            let chapterHtml = `<div id="chapter${index + 1}"></div>` + chapter.html;
            combinedHtml += chapterHtml;
        });
        titlesHtml = '<ol>'+titlesHtml+'</ol>';

        combinedHtml = convertMathInParagraphs(combinedHtml);

        const finalHtml = `
        <h1>${title}</h1>
        <br>
        <br>
        <div class="titles">${titlesHtml}</div>
        <div class="content">${combinedHtml}</div>
        `;

        let htmlString = `
            <!DOCTYPE html>
            <html>
            <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css" />
            <link rel="stylesheet" href="assets/minimalist-blocks/content.css">
            <title>${title}</title>
            <style>
                body {
                    font-family: system-ui, sans-serif;
                    font-size: 1.2rem;
                    line-height: 1.5;
                    font-weight: 400;
                    margin: 60px;
                    background:#fff;
                }
                h1, h2, h3, h4, h5, h6 {
                    font-weight: 600;
                    line-height: 1.2;
                }
            
                h1 {font-size: 3.5rem; }
                h2 {font-size: 2rem; margin: 1.5rem 0 1.5rem; }
                h3 {font-size: 1.5rem; margin: 1.5rem 0 1.5rem; }
                h4 {font-size: 1.3rem; margin: 1.5rem 0 1.5rem; }
                h5 {font-size: 1.2rem; margin: 1.5rem 0 1.5rem; }
                p, pre, ol, ul {margin:1.5rem 0 1.5rem;}
            
                pre {
                    font-size: 16px;
                    /* This makes text wrap inside <pre> */
                    white-space: pre-wrap; 
                }
                h2 {
                    page-break-before: always;
                    page-break-after: avoid; /* Prevents a page break immediately after */
                }
                
                /* Ensure headings and their following paragraphs stay together */
                h3, h4 {
                    page-break-inside: avoid; /* Prevents breaking within h3 or h4 */
                }
                
                /* Avoid splitting paragraphs inside h3 and h4 */
                h2 + h3, h3 + h4,
                h3 + p, h3 + ol, h3 + ul, 
                h4 + p, h4 + ol, h4 + ul, 
                p + ol, p + ul {
                    page-break-before: avoid; /* Prevents a break before the paragraph after h3/h4 */
                }
                
                /* Ensure paragraphs are not split */
                p {
                    page-break-inside: avoid;
                }
                
                /* Additional styling to ensure no awkward breaks */
                ul, ol {
                    page-break-inside: avoid; /* Avoid breaking lists */
                }

                /* override content.css */
                pre {
                    line-height: 1.26 !important;
                    padding: 0;
                    background: transparent;
                }
                a {
                    color: #111 !important;
                }

                @media print {
                    @page {
                      margin: 10mm !important; 
                      margin-top: 25mm !important; 
                      margin-bottom: 25mm !important;
                    }
                }
            </style>
            </head>
            <body>
            ${finalHtml}
            <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
            </body>
            </html>
        `;

        /*
            @page {
                size: A4;
                margin: 10mm !important; 
                margin-top: 25mm !important; 
                margin-bottom: 25mm !important;
            }
        */

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '0px';
        iframe.style.left = '0px';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        iframe.style.zIndex = '-1';
        // iframe.style.width = '1000px';
        // iframe.style.height = '1000px';
        // iframe.style.zIndex = '1000';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(htmlString);
        doc.close();

        iframe.onload = () => {

            const mydoc = iframe.contentWindow.document;
            const cols = mydoc.querySelectorAll('.column');
            cols.forEach(col=>{
                col.outerHTML = col.innerHTML;
            });
            const rows = mydoc.querySelectorAll('.row');
            rows.forEach(row=>{
                row.outerHTML = row.innerHTML;
            });
            iframe.contentWindow.focus();
            iframe.contentWindow.print();

            document.body.removeChild(iframe);
        };

    }

    return (
        <div>
            <button
                className="text-sm px-5 pl-4 py-2 bg-gray-200 p-2 px-3 text-sm rounded-full focus:outline-none mt-6 m-4 flex items-center"
                onClick={() => handlePrint()}>
                <PrinterIcon className="size-4 mr-1" />
                Print Book
            </button>
        </div>
    );
};

export default PrintBookButton;
