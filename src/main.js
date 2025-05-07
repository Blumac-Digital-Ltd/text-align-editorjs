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

    /**
     * Allow the inline alignment settings to be saved in the HTML
     */
    static get sanitize() {
        return {
            p: {
                class: true,
                style: true,
                'data-text-align': true
            },
            div: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h1: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h2: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h3: {
                class: true, 
                style: true,
                'data-text-align': true
            },
            h4: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h5: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h6: {
                class: true,
                style: true,
                'data-text-align': true
            }
        };
    }

    constructor({api, config = {}}){
        this.currenticon = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"></svg>';
        this.button = null;
        this.state = "left";
        this.api = api;
        this.config = config;
        
        // Initialize listeners for saving data
        this.initListeners();
    }
    
    /**
     * Initialize listeners for saving alignment data
     */
    initListeners() {
        // Subscribe to the block's change event to save alignment
        this.api.listeners.on('block-changed', (blockAPI, event) => {
            // Find alignment within the block and save it
            this.saveAlignmentToBlockData(blockAPI);
        });
        
        // Also track when a block is rendered to apply existing alignment
        this.api.listeners.on('block-rendered', (blockAPI) => {
            // Apply alignment if it exists in block data
            this.applyAlignmentFromBlockData(blockAPI);
        });
    }
    
    /**
     * Extract alignment from DOM and save it to block data
     * @param {Object} blockAPI - Block API instance
     */
    saveAlignmentToBlockData(blockAPI) {
        try {
            const block = blockAPI.holder;
            if (!block) return;
            
            // Find all paragraphs and headers within the block
            const elements = block.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6');
            
            if (elements.length === 0) return;
            
            // For simplicity, just use the first element's alignment
            const element = elements[0];
            const alignment = element.dataset.textAlign || this.getComputedAlignment(element);
            
            if (alignment && alignment !== 'left') {
                // Get current data
                const data = blockAPI.data || {};
                
                // Save alignment to block data
                blockAPI.data = {
                    ...data,
                    align: alignment
                };
            }
        } catch (err) {
            console.error('Error saving alignment data:', err);
        }
    }
    
    /**
     * Apply alignment from block data to DOM element
     * @param {Object} blockAPI - Block API instance
     */
    applyAlignmentFromBlockData(blockAPI) {
        try {
            const align = blockAPI.data.align;
            if (!align || align === 'left') return;
            
            const block = blockAPI.holder;
            if (!block) return;
            
            // Find all paragraphs and headers within the block
            const elements = block.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6');
            
            // Apply alignment to all elements
            elements.forEach(element => {
                element.style.textAlign = align;
                element.dataset.textAlign = align;
            });
        } catch (err) {
            console.error('Error applying alignment data:', err);
        }
    }
    
    /**
     * Get computed alignment from element
     * @param {HTMLElement} element - DOM element
     * @returns {string} - Alignment value
     */
    getComputedAlignment(element) {
        const align = window.getComputedStyle(element).textAlign;
        if (align === 'center') return 'center';
        if (align === 'right') return 'right';
        if (align === 'justify') return 'justify';
        return 'left';
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
        
        // Store alignment in both style and data attribute for better persistence
        if (this.state === "left") {
            firstParentNode.style.textAlign = "center";
            firstParentNode.dataset.textAlign = "center";
            this.state = "center";
        }
        else if (this.state === "center") {
            firstParentNode.style.textAlign = "right";
            firstParentNode.dataset.textAlign = "right";
            this.state = "right";
        }
        else if (this.state === "right") {
            firstParentNode.style.textAlign = "justify";
            firstParentNode.dataset.textAlign = "justify";
            this.state = "justify";
        }
        else if (this.state === "justify") {
            firstParentNode.style.textAlign = "left";
            firstParentNode.dataset.textAlign = "left";
            this.state = "left";
        }
        
        // Find the current block and save alignment
        const currentBlockElement = this.findCurrentBlock(firstParentNode);
        if (currentBlockElement) {
            const blockId = currentBlockElement.dataset.id || currentBlockElement.id;
            
            // Use setTimeout to ensure DOM changes are processed
            setTimeout(() => {
                try {
                    // Try to find the block API for this block
                    const blockIndex = this.findBlockIndex(blockId);
                    if (blockIndex !== -1) {
                        const blockAPI = this.api.blocks.getBlockByIndex(blockIndex);
                        if (blockAPI) {
                            this.saveAlignmentToBlockData(blockAPI);
                        }
                    }
                } catch (err) {
                    console.error('Error finding block:', err);
                }
            }, 0);
        }
        
        // Force the editor to recognize this change as a content update
        this.api.inlineToolbar.close();
    }
    
    /**
     * Find the current block element containing a node
     * @param {HTMLElement} node - DOM node
     * @returns {HTMLElement|null} - Block element or null
     */
    findCurrentBlock(node) {
        let current = node;
        
        // Traverse up until we find a block element
        while (current && current.parentNode) {
            // Check if this element is a block in EditorJS
            if (current.classList && (
                current.classList.contains('ce-block') ||
                current.classList.contains('ce-block__content')
            )) {
                return current;
            }
            
            // Move up the DOM
            current = current.parentNode;
        }
        
        return null;
    }
    
    /**
     * Find the index of a block by its ID
     * @param {string} blockId - Block ID
     * @returns {number} - Block index or -1 if not found
     */
    findBlockIndex(blockId) {
        try {
            // Get count of blocks
            const blockCount = this.api.blocks.getBlocksCount();
            
            // Iterate through all blocks to find matching ID
            for (let i = 0; i < blockCount; i++) {
                const block = this.api.blocks.getBlockByIndex(i);
                if (block && block.id === blockId) {
                    return i;
                }
            }
        } catch (err) {
            console.error('Error finding block index:', err);
        }
        
        return -1;
    }

    checkState(selection){
        if (!selection) {
            return;
        }

        try {
            const anchorReq = this.api.selection.findParentTag(selection);
            
            // First check data attribute (our stored value)
            if (anchorReq.dataset.textAlign) {
                this.state = anchorReq.dataset.textAlign;
            }
            // Fallback to computed style
            else {
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
            }
        } catch (e) {
            // If there's an error, default to left alignment
            this.state = 'left';
        }
        
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
