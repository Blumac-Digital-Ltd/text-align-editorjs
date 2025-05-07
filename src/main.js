class TextAlign {
    static leftAlignedIcon = '<path d="M17 9.5H3M21 4.5H3M21 14.5H3M17 19.5H3"/>'
    static centerAlignedIcon = '<path d="M19 9.5H5M21 4.5H3M21 14.5H3M19 19.5H5"/>'
    static rightAlignedIcon = '<path d="M21 9.5H7M21 4.5H3M21 14.5H3M21 19.5H7"/>' //'<path d="M17 9.5H3M21 4.5H3M21 14.5H3M17 19.5H3"/>'
    static justifyAlignedIcon = '<path d="M21 9.5H3M21 4.5H3M21 14.5H3M21 19.5H3"/>'

    static get isInline() {
        return true;
    }
    
    // Add this to specify which blocks this tool can be used with
    static get sanitize() {
        return {
            header: true,
            paragraph: true
        };
    }
    
    // Explicitly list supported block types
    static get supportedBlockTypes() {
        return ['paragraph', 'header'];
    }
    
    // Add method to preserve text alignment on initial render
    static get pasteConfig() {
        return {
            tags: ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
        };
    }
    
    // Add proper block-level integration
    static get enableLineBreaks() {
        return true;
    }
    
    // Add block-level integration for specifying alignment classnames
    static get blockClassNames() {
        return {
            'text-align-left': 'text-align-left',
            'text-align-center': 'text-align-center',
            'text-align-right': 'text-align-right',
            'text-align-justify': 'text-align-justify'
        };
    }
    
    // Convert DOM to data
    static get conversionConfig() {
        return {
            export: (domNode) => {
                const alignmentStyle = domNode.style.textAlign;
                if (!alignmentStyle) return {};
                
                return {
                    textAlign: alignmentStyle
                };
            },
            import: (data) => {
                return {
                    textAlign: data.textAlign || 'left'
                };
            }
        };
    }
    
    constructor({ api }) {
        //console.log("Constructing")
        this.currenticon = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"></svg>'
        this.aligncurrenticon = new DOMParser().parseFromString(this.currenticon,'application/xml');
        this.button = null;
        this.state = "left";
        this.api = api
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.classList = 'ce-inline-tool ce-inline-tool--align-text';
        this.button.appendChild(this.button.ownerDocument.importNode(this.aligncurrenticon.documentElement, true))
        this.setIcon()
        return this.button;
    }

    surround(range) {
        //console.log("Surrounding")
        const firstParentNode = this.getParentNode(range.commonAncestorContainer)
        if (this.state === "left") {
            firstParentNode.style.textAlign = "center"
            this.state = "center"
        }
        else if (this.state === "center") {
            firstParentNode.style.textAlign = "right"
            this.state = "right"
        }
        else if (this.state === "right") {
            firstParentNode.style.textAlign = "justify"
            this.state = "justify"
        }
        else if (this.state === "justify") {
            firstParentNode.style.textAlign = "left"
            this.state = "left"
        }
    }

    checkState(text){
        if (!text) {
            return;
        }
        
        try {
            // Instead of trying to get current block through non-existent API
            // Get the current alignment from the selected range
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const parentNode = this.getParentNode(range.commonAncestorContainer);
                
                if (parentNode) {
                    const computedStyle = window.getComputedStyle(parentNode);
                    const textAlign = computedStyle.getPropertyValue('text-align');
                    
                    if (textAlign === 'center') {
                        this.state = 'center';
                    } else if (textAlign === 'right') {
                        this.state = 'right';
                    } else if (textAlign === 'justify') {
                        this.state = 'justify';
                    } else {
                        this.state = 'left';
                    }
                }
            }
        } catch (e) {
            console.warn('Error checking text alignment state', e);
        }
        
        this.setIcon();
    }

    // Method to handle block data saving
    save(blockContent) {
        const alignmentData = {};
        
        try {
            if (blockContent && blockContent.style && blockContent.style.textAlign) {
                alignmentData.textAlign = blockContent.style.textAlign;
            } else if (blockContent && blockContent.parentNode && blockContent.parentNode.style && blockContent.parentNode.style.textAlign) {
                // Try parent node if blockContent doesn't have alignment
                alignmentData.textAlign = blockContent.parentNode.style.textAlign;
            }
        } catch (e) {
            console.warn('TextAlign plugin: Error saving alignment data', e);
        }
        
        return alignmentData;
    }
    
    // Method to handle block rendering and restore alignment
    static get onRender() {
        return (block) => {
            // Try to restore alignment if it exists in the data
            setTimeout(() => {
                try {
                    const blockData = block.data || {};
                    
                    // Check if we have alignment data
                    if (blockData.textAlign) {
                        // Apply alignment to the block holder
                        if (block.holder) {
                            block.holder.style.textAlign = blockData.textAlign;
                            
                            // Find and align all relevant child elements
                            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'].forEach(tagName => {
                                const elements = block.holder.querySelectorAll(tagName);
                                elements.forEach(el => {
                                    el.style.textAlign = blockData.textAlign;
                                });
                            });
                        }
                    }
                } catch (e) {
                    console.warn('TextAlign plugin: Error restoring alignment', e);
                }
            }, 0);
        };
    }

    // Find parent node until it is DIV, Paragraph or Heading
    getParentNode(node){
        const validTags = ["DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6"];
        if (node?.parentNode && validTags.includes(node.parentNode.tagName)) {
            return node.parentNode;
        }
        else {
            return this.getParentNode(node.parentNode);
        }
    }

    setIcon(){
        if (this.state === "" || this.state === "left"){
            this.button.childNodes[0].innerHTML = TextAlign.leftAlignedIcon
        }
        else if (this.state === "center"){
            this.button.childNodes[0].innerHTML = TextAlign.centerAlignedIcon
        }
        else if (this.state === "right"){
            this.button.childNodes[0].innerHTML = TextAlign.rightAlignedIcon
        }
        else if (this.state === "justify"){
            this.button.childNodes[0].innerHTML = TextAlign.justifyAlignedIcon
        }
    }
}


export default TextAlign;
