import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { useEffect} from 'react';

const MathContentWrapper = ({ bookHtml }) => {
    // Effect to re-render MathJax after HTML bookHtml is injected
    useEffect(() => {
        window.MathJax && window.MathJax.typeset();
    }, [bookHtml]);
    
    function wrapContentWithDOMParser(content) {
        if (content.includes('class="row"') && content.includes('class="column"')) {
            return content.trim(); // No further processing needed
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
    
        const fragment = document.createDocumentFragment();
    
        doc.body.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {

                const rowDiv = document.createElement('div');
                rowDiv.className = 'row';
                
                const columnDiv = document.createElement('div');
                columnDiv.className = 'column';
    
                columnDiv.appendChild(node.cloneNode(true));
                rowDiv.appendChild(columnDiv);
    
                fragment.appendChild(rowDiv);
            }
        });
    
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);
        
        return tempDiv.innerHTML.trim();
    }

    return (
        <MathJaxContext>
            <div className="container max-w-3xl mx-auto w-full relative mt-10" style={{ marginBottom: '500px' }} dangerouslySetInnerHTML={{ __html: wrapContentWithDOMParser(bookHtml) }} />
        </MathJaxContext> 
    );
};
export default MathContentWrapper;