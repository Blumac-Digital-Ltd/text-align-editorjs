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
    
    constructor({ api, config = {} }) {
        this.currenticon = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"></svg>'
        this.aligncurrenticon = new DOMParser().parseFromString(this.currenticon,'application/xml');
        this.button = null;
        this.state = "left";
        this.api = api;
        this.config = config;
        
        // Subscribe to the 'block-rendered' event to apply alignment
        this.api.listeners.on('block-rendered', this._onBlockRendered.bind(this));
    }
    
    // Handler for block-rendered event
    _onBlockRendered(block) {
        try {
            const blockData = block.block.data;
            
            // Check for alignment data - could be in tunes or directly in block data
            let textAlign;
            if (blockData.tunes && blockData.tunes.textAlign) {
                textAlign = blockData.tunes.textAlign.alignment;
            } else if (blockData.textAlign) {
                textAlign = blockData.textAlign;
            }
            
            if (textAlign) {
                const holder = block.htmlElement;
                if (holder) {
                    // Apply alignment to the block holder
                    holder.style.textAlign = textAlign;
                    
                    // Apply to header elements
                    const headers = holder.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    headers.forEach(header => {
                        header.style.textAlign = textAlign;
                    });
                    
                    // Apply to paragraph elements
                    const paragraphs = holder.querySelectorAll('p, div.ce-paragraph');
                    paragraphs.forEach(p => {
                        p.style.textAlign = textAlign;
                    });
                }
            }
        } catch (error) {
            console.warn('TextAlign: Error applying alignment on block render', error);
        }
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
        const firstParentNode = this.getParentNode(range.commonAncestorContainer);
        if (this.state === "left") {
            firstParentNode.style.textAlign = "center";
            this.state = "center";
        }
        else if (this.state === "center") {
            firstParentNode.style.textAlign = "right";
            this.state = "right";
        }
        else if (this.state === "right") {
            firstParentNode.style.textAlign = "justify";
            this.state = "justify";
        }
        else if (this.state === "justify") {
            firstParentNode.style.textAlign = "left";
            this.state = "left";
        }
        
        // Save the alignment to the block data
        this._saveAlignmentToBlock(firstParentNode);
    }

    // New method to save alignment data to the block
    _saveAlignmentToBlock(node) {
        try {
            const currentBlock = this.api.blocks.getBlockByChildNode(node);
            if (!currentBlock) return;
            
            const blockData = currentBlock.save();
            
            if (!blockData.data.tunes) {
                blockData.data.tunes = {};
            }
            
            if (!blockData.data.tunes.textAlign) {
                blockData.data.tunes.textAlign = {};
            }
            
            blockData.data.tunes.textAlign.alignment = node.style.textAlign;
            
            // Also save in the main data for backward compatibility
            blockData.data.textAlign = node.style.textAlign;
            
            currentBlock.save();
        } catch (error) {
            console.warn('TextAlign: Error saving alignment data to block', error);
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

    // Method for Block API compatibility
    save(blockContent) {
        const alignment = {};
        
        try {
            if (blockContent && blockContent.style && blockContent.style.textAlign) {
                alignment.textAlign = blockContent.style.textAlign;
            }
        } catch (error) {
            console.warn('TextAlign: Error in save method', error);
        }
        
        return alignment;
    }
    
    // Method to handle data serialization for Block Tools API
    static get tunes() {
        return [{
            name: 'textAlign',
            data: {
                alignment: 'left' // default alignment
            }
        }];
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
