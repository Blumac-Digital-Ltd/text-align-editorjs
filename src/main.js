class TextAlign {
    static leftAlignedIcon = '<path d="M17 9.5H3M21 4.5H3M21 14.5H3M17 19.5H3"/>'
    static centerAlignedIcon = '<path d="M19 9.5H5M21 4.5H3M21 14.5H3M19 19.5H5"/>'
    static rightAlignedIcon = '<path d="M21 9.5H7M21 4.5H3M21 14.5H3M21 19.5H7"/>' //'<path d="M17 9.5H3M21 4.5H3M21 14.5H3M17 19.5H3"/>'
    static justifyAlignedIcon = '<path d="M21 9.5H3M21 4.5H3M21 14.5H3M21 19.5H3"/>'
    
    static get isInline() {
        return true;
    }

    static get title() {
        return 'Text Alignment';
    }

    constructor({api, config = {}}){
        this.currenticon = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"></svg>';
        this.button = null;
        this.state = "left";
        this.api = api;
        this.config = config;
        this.tag = 'DIV';
        this.class = 'text-align';
    }

    render(){
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.classList.add('text-align-tool');
        this.currentvalue = this.config?.default;
        this.setIcon();
        return this.button;
    }

    surround(range){
        const firstParentNode = this.getParentNode(range.startContainer);
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
        
        // Save alignment data to the block
        this.saveAlignmentData(firstParentNode);
    }
    
    /**
     * Save the alignment data to the current block
     * 
     * @param {HTMLElement} node - The node containing text alignment
     */
    saveAlignmentData(node) {
        const currentBlock = this.api.blocks.getCurrentBlock();
        if (currentBlock) {
            const blockData = this.api.blocks.getBlockData(currentBlock.id);
            
            // Update the block data with alignment information
            this.api.blocks.update(currentBlock.id, {
                ...blockData,
                textAlign: this.state
            });
        }
    }

    /**
     * Apply saved alignment data when a block is rendered
     */
    static prepare({data}) {
        const blockContent = document.createElement('div');
        
        // If the block has alignment data, apply it to the element
        if (data && data.textAlign) {
            blockContent.style.textAlign = data.textAlign;
        }
        
        return blockContent;
    }

    /**
     * Sanitize tool data to save
     * 
     * @param {HTMLElement} node - Node with alignment
     * @returns {object} - Sanitized data
     */
    static sanitize(data) {
        if (!data.textAlign) {
            return {
                ...data,
                textAlign: 'left' // Default alignment if none specified
            };
        }
        
        return data;
    }

    checkState(text){
        if (!text) {
            return;
        }

        try {
            const anchorReq = this.api.selection.findParentTag(text);
            const textAlign = window.getComputedStyle(anchorReq).textAlign;
            if (textAlign === 'center') {
                this.state = 'center';
            } else if (textAlign === 'right') {
                this.state = 'right';
            } else if (textAlign === 'justify') {
                this.state = 'justify';
            } else {
                this.state = 'left';
            }
        } catch (e) {}
        
        this.setIcon();
    }

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
        if (this.state === "center") {
            this.currenticon = TextAlign.centerAlignedIcon;
        }
        else if (this.state === "right") {
            this.currenticon = TextAlign.rightAlignedIcon;
        }
        else if (this.state === "justify") {
            this.currenticon = TextAlign.justifyAlignedIcon;
        }
        else {
            this.currenticon = TextAlign.leftAlignedIcon;
        }
        
        const icon = this.currenticon;
        this.button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs">' + icon + '</svg>';
    }
}

export default TextAlign;
