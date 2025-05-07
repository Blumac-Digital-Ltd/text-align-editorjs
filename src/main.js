class TextAlign {
    static leftAlignedIcon = '<path d="M17 9.5H3M21 4.5H3M21 14.5H3M17 19.5H3"/>'
    static centerAlignedIcon = '<path d="M19 9.5H5M21 4.5H3M21 14.5H3M19 19.5H5"/>'
    static rightAlignedIcon = '<path d="M21 9.5H7M21 4.5H3M21 14.5H3M21 19.5H7"/>' //'<path d="M17 9.5H3M21 4.5H3M21 14.5H3M17 19.5H3"/>'
    static justifyAlignedIcon = '<path d="M21 9.5H3M21 4.5H3M21 14.5H3M21 19.5H3"/>'

    // These methods are critical for inline tools
    static get isInline() {
        return true;
    }
    
    // This critical method tells EditorJS when to show this inline tool
    static get isInlineTool() {
        return true;
    }
    
    // This is used to recognize the tool in the inline toolbar
    static get CSS() {
        return 'ce-inline-tool-text-align';
    }
    
    // The name affects how the tool is identified by EditorJS
    static get name() {
        return 'textAlign';
    }
    
    // Title displayed on hover
    static get title() {
        return 'Text Alignment';
    }
    
    // Make sure the tool shows up in the toolbar
    static get displayInToolbox() {
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
        this.currenticon = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"></svg>';
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
        this.button.classList.add('ce-inline-tool');
        this.button.classList.add(TextAlign.CSS);
        
        // Add tooltip
        this.button.title = TextAlign.title || 'Text Alignment';
        
        // Create SVG icon
        const svgIcon = document.createElement('svg');
        svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgIcon.setAttribute('width', '17');
        svgIcon.setAttribute('height', '17');
        svgIcon.setAttribute('viewBox', '0 0 24 24');
        svgIcon.setAttribute('fill', 'none');
        svgIcon.setAttribute('stroke', 'currentColor');
        svgIcon.setAttribute('stroke-width', '2');
        svgIcon.setAttribute('stroke-linecap', 'square');
        svgIcon.setAttribute('stroke-linejoin', 'arcs');
        
        // Add path element for the icon
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', TextAlign.leftAlignedIcon.replace(/<path d="(.+)"\/>/, '$1'));
        
        svgIcon.appendChild(path);
        this.button.appendChild(svgIcon);
        
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

    // This tells EditorJS to enable this tool in the inline toolbar
    showInlineToolbar() {
        return true;
    }

    // Force the inline tool to be visible whenever text is selected
    checkState(selection) {
        try {
            // Make sure the toolbar is shown when text is selected
            if (selection && !selection.isCollapsed) {
                this.button.classList.add('ce-inline-tool--active');
                return true;
            } else {
                this.button.classList.remove('ce-inline-tool--active');
                return false;
            }
        } catch (e) {
            console.warn('Error checking text alignment state', e);
            return false;
        }
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
        if (!this.button) return;
        
        // Find the path element in our SVG
        const svgElement = this.button.querySelector('svg');
        const pathElement = svgElement ? svgElement.querySelector('path') : null;
        
        if (!pathElement) return;
        
        // Get the proper path data based on alignment state
        let pathData;
        if (this.state === "center") {
            pathData = TextAlign.centerAlignedIcon.replace(/<path d="(.+)"\/>/, '$1');
        }
        else if (this.state === "right") {
            pathData = TextAlign.rightAlignedIcon.replace(/<path d="(.+)"\/>/, '$1');
        }
        else if (this.state === "justify") {
            pathData = TextAlign.justifyAlignedIcon.replace(/<path d="(.+)"\/>/, '$1');
        }
        else { // left or default
            pathData = TextAlign.leftAlignedIcon.replace(/<path d="(.+)"\/>/, '$1');
        }
        
        // Update the path's d attribute
        pathElement.setAttribute('d', pathData);
    }
}


export default TextAlign;
