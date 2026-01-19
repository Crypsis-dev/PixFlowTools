// Main Application
class PixFlowTools {
    constructor() {
        this.currentTool = null;
        this.currentFiles = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        // Dark mode
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem('theme', 'light');
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });

        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolCard = e.target.closest('.tool-card');
                const toolId = toolCard.dataset.tool;
                this.loadTool(toolId);
            });
        });

        // Back to tools
        document.getElementById('back-to-tools').addEventListener('click', () => {
            document.getElementById('tool-interface').style.display = 'none';
            document.getElementById('tools').scrollIntoView();
        });

        // File upload
        this.setupFileUpload();
    }

    setupFileUpload() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.backgroundColor = '';
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.backgroundColor = '';
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFiles(files);
        });
    }

    handleFiles(files) {
        this.currentFiles = files;
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = files.map(file => `
            <div class="file-item">
                <i class="fas fa-file"></i>
                <span>${file.name} (${this.formatBytes(file.size)})</span>
            </div>
        `).join('');
        
        // Close modal after selection
        this.hideModal();
        
        // Process files based on current tool
        if (this.currentTool) {
            this.processTool();
        }
    }

    loadTool(toolId) {
        this.currentTool = toolId;
        const toolTitles = {
            'image-to-pdf': 'Image to PDF Converter',
            'image-resizer': 'Image Resizer',
            'pdf-compressor': 'PDF Compressor',
            'bg-remover': 'Background Remover',
            'pdf-to-images': 'PDF to Images',
            'image-compressor': 'Image Compressor',
            'document-scanner': 'Document Scanner',
            'pdf-merger': 'PDF Merger'
        };
        
        document.getElementById('current-tool-title').textContent = toolTitles[toolId];
        document.getElementById('tool-interface').style.display = 'block';
        document.getElementById('tool-interface').scrollIntoView();
        
        this.renderToolInterface(toolId);
    }

    renderToolInterface(toolId) {
        const toolContent = document.getElementById('tool-content');
        
        switch(toolId) {
            case 'image-to-pdf':
                toolContent.innerHTML = this.getImageToPDFInterface();
                break;
            case 'image-resizer':
                toolContent.innerHTML = this.getImageResizerInterface();
                break;
            case 'pdf-compressor':
                toolContent.innerHTML = this.getPDFCompressorInterface();
                break;
            case 'bg-remover':
                toolContent.innerHTML = this.getBGRemoverInterface();
                break;
            case 'pdf-to-images':
                toolContent.innerHTML = this.getPDFToImagesInterface();
                break;
            case 'image-compressor':
                toolContent.innerHTML = this.getImageCompressorInterface();
                break;
            case 'document-scanner':
                toolContent.innerHTML = this.getDocumentScannerInterface();
                break;
            case 'pdf-merger':
                toolContent.innerHTML = this.getPDFMergerInterface();
                break;
        }
        
        // Add event listeners to the new interface
        this.setupToolEventListeners(toolId);
    }

    getImageToPDFInterface() {
        return `
            <div class="tool-content">
                <div class="tool-input">
                    <div class="drop-area" onclick="document.getElementById('file-input').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <h3>Upload Images</h3>
                        <p>Drag & drop or click to upload JPG, PNG, WebP images</p>
                        <p class="drop-sub">Supports multiple images</p>
                    </div>
                    <div class="controls">
                        <div class="control-group">
                            <label>Page Size:</label>
                            <select id="page-size">
                                <option value="a4">A4</option>
                                <option value="letter">Letter</option>
                                <option value="legal">Legal</option>
                                <option value="fit">Fit to Image</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label>Orientation:</label>
                            <select id="orientation">
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label>Margin:</label>
                            <input type="range" id="margin" min="0" max="50" value="10">
                            <span id="margin-value">10 mm</span>
                        </div>
                    </div>
                    <button class="action-btn" id="process-btn" onclick="app.showUploadModal()">
                        <i class="fas fa-upload"></i> Upload Images
                    </button>
                </div>
                <div class="tool-output">
                    <div id="preview-container" class="preview-container">
                        <p class="placeholder">Preview will appear here</p>
                    </div>
                    <div id="output-info" class="output-info">
                        <p>Upload images to start conversion</p>
                    </div>
                    <button class="action-btn" id="download-btn" disabled>
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </div>
            </div>
        `;
    }

    getImageResizerInterface() {
        return `
            <div class="tool-content">
                <div class="tool-input">
                    <div class="drop-area" onclick="document.getElementById('file-input').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <h3>Upload Image</h3>
                        <p>Drag & drop or click to upload image</p>
                    </div>
                    <div class="controls">
                        <div class="control-group">
                            <label>Resize Mode:</label>
                            <select id="resize-mode">
                                <option value="percentage">Percentage</option>
                                <option value="dimensions">Custom Dimensions</option>
                                <option value="preset">Preset Sizes</option>
                            </select>
                        </div>
                        <div id="percentage-control" class="control-group">
                            <label>Scale Percentage:</label>
                            <input type="range" id="scale-percent" min="10" max="200" value="100">
                            <span id="scale-value">100%</span>
                        </div>
                        <div id="dimensions-control" class="control-group" style="display: none;">
                            <div class="dimension-inputs">
                                <div>
                                    <label>Width (px):</label>
                                    <input type="number" id="width" min="10" max="5000" value="800">
                                </div>
                                <div>
                                    <label>Height (px):</label>
                                    <input type="number" id="height" min="10" max="5000" value="600">
                                </div>
                            </div>
                            <label>
                                <input type="checkbox" id="maintain-aspect"> Maintain Aspect Ratio
                            </label>
                        </div>
                        <div id="preset-control" class="control-group" style="display: none;">
                            <select id="preset-size">
                                <option value="instagram">Instagram (1080x1080)</option>
                                <option value="facebook">Facebook (1200x630)</option>
                                <option value="twitter">Twitter (1200x675)</option>
                                <option value="linkedin">LinkedIn (1200x627)</option>
                                <option value="hd">HD (1280x720)</option>
                                <option value="fullhd">Full HD (1920x1080)</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label>Output Format:</label>
                            <select id="output-format">
                                <option value="jpg">JPG</option>
                                <option value="png">PNG</option>
                                <option value="webp">WebP</option>
                            </select>
                        </div>
                    </div>
                    <button class="action-btn" id="process-btn" onclick="app.showUploadModal()">
                        <i class="fas fa-upload"></i> Upload Image
                    </button>
                </div>
                <div class="tool-output">
                    <div id="preview-container" class="preview-container">
                        <p class="placeholder">Original image will appear here</p>
                    </div>
                    <div id="output-info" class="output-info">
                        <p>Upload image to start resizing</p>
                    </div>
                    <button class="action-btn" id="download-btn" disabled>
                        <i class="fas fa-download"></i> Download Resized Image
                    </button>
                </div>
            </div>
        `;
    }

    getPDFCompressorInterface() {
        return `
            <div class="tool-content">
                <div class="tool-input">
                    <div class="drop-area" onclick="document.getElementById('file-input').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <h3>Upload PDF</h3>
                        <p>Drag & drop or click to upload PDF file</p>
                    </div>
                    <div class="controls">
                        <div class="control-group">
                            <label>Compression Level:</label>
                            <input type="range" id="compression-level" min="1" max="5" value="3">
                            <div class="compression-labels">
                                <span>Small File</span>
                                <span>Balanced</span>
                                <span>Best Quality</span>
                            </div>
                        </div>
                        <div class="control-group">
                            <label>Image Quality:</label>
                            <input type="range" id="image-quality" min="10" max="100" value="75">
                            <span id="quality-value">75%</span>
                        </div>
                        <div class="control-group">
                            <label>Remove:</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" id="remove-metadata"> Metadata</label>
                                <label><input type="checkbox" id="remove-bookmarks"> Bookmarks</label>
                                <label><input type="checkbox" id="compress-images"> Compress Images</label>
                            </div>
                        </div>
                    </div>
                    <button class="action-btn" id="process-btn" onclick="app.showUploadModal()">
                        <i class="fas fa-upload"></i> Upload PDF
                    </button>
                </div>
                <div class="tool-output">
                    <div id="preview-container" class="preview-container">
                        <p class="placeholder">PDF info will appear here</p>
                    </div>
                    <div id="output-info" class="output-info">
                        <p>Upload PDF to start compression</p>
                    </div>
                    <button class="action-btn" id="download-btn" disabled>
                        <i class="fas fa-download"></i> Download Compressed PDF
                    </button>
                </div>
            </div>
        `;
    }

    // Additional tool interfaces would be defined here...

    setupToolEventListeners(toolId) {
        // Add event listeners based on the tool
        switch(toolId) {
            case 'image-to-pdf':
                this.setupImageToPDFListeners();
                break;
            case 'image-resizer':
                this.setupImageResizerListeners();
                break;
            case 'pdf-compressor':
                this.setupPDFCompressorListeners();
                break;
            // Add cases for other tools...
        }
    }

    setupImageToPDFListeners() {
        const marginSlider = document.getElementById('margin');
        const marginValue = document.getElementById('margin-value');
        
        if (marginSlider) {
            marginSlider.addEventListener('input', () => {
                marginValue.textContent = `${marginSlider.value} mm`;
            });
        }
        
        document.getElementById('process-btn').addEventListener('click', () => {
            this.showUploadModal();
        });
    }

    setupImageResizerListeners() {
        const resizeMode = document.getElementById('resize-mode');
        const scaleSlider = document.getElementById('scale-percent');
        const scaleValue = document.getElementById('scale-value');
        
        if (resizeMode) {
            resizeMode.addEventListener('change', () => {
                document.getElementById('percentage-control').style.display = 
                    resizeMode.value === 'percentage' ? 'block' : 'none';
                document.getElementById('dimensions-control').style.display = 
                    resizeMode.value === 'dimensions' ? 'block' : 'none';
                document.getElementById('preset-control').style.display = 
                    resizeMode.value === 'preset' ? 'block' : 'none';
            });
        }
        
        if (scaleSlider) {
            scaleSlider.addEventListener('input', () => {
                scaleValue.textContent = `${scaleSlider.value}%`;
            });
        }
    }

    async processTool() {
        if (this.isProcessing || this.currentFiles.length === 0) return;
        
        this.isProcessing = true;
        const processBtn = document.getElementById('process-btn');
        const originalText = processBtn.innerHTML;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        processBtn.disabled = true;
        
        try {
            switch(this.currentTool) {
                case 'image-to-pdf':
                    await this.convertImagesToPDF();
                    break;
                case 'image-resizer':
                    await this.resizeImage();
                    break;
                case 'pdf-compressor':
                    await this.compressPDF();
                    break;
                case 'bg-remover':
                    await this.removeBackground();
                    break;
                case 'pdf-to-images':
                    await this.convertPDFToImages();
                    break;
                case 'image-compressor':
                    await this.compressImage();
                    break;
                // Add cases for other tools...
            }
        } catch (error) {
            console.error('Error processing tool:', error);
            this.showError('Failed to process files. Please try again.');
        } finally {
            this.isProcessing = false;
            processBtn.innerHTML = originalText;
            processBtn.disabled = false;
        }
    }

    async convertImagesToPDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        const pageSize = document.getElementById('page-size')?.value || 'a4';
        const orientation = document.getElementById('orientation')?.value || 'portrait';
        
        for (let i = 0; i < this.currentFiles.length; i++) {
            const file = this.currentFiles[i];
            const img = await this.loadImage(file);
            
            if (i > 0) pdf.addPage();
            
            const imgProps = pdf.getImageProperties(img);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            let width = pdfWidth;
            let height = (imgProps.height * pdfWidth) / imgProps.width;
            
            if (height > pdfHeight) {
                height = pdfHeight;
                width = (imgProps.width * pdfHeight) / imgProps.height;
            }
            
            const x = (pdfWidth - width) / 2;
            const y = (pdfHeight - height) / 2;
            
            pdf.addImage(img, 'JPEG', x, y, width, height);
        }
        
        const pdfBlob = pdf.output('blob');
        this.createDownloadLink(pdfBlob, 'converted.pdf');
        this.updateOutputInfo(`Created PDF with ${this.currentFiles.length} page(s)`);
    }

    async resizeImage() {
        const file = this.currentFiles[0];
        const img = await this.loadImage(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const resizeMode = document.getElementById('resize-mode')?.value || 'percentage';
        let newWidth, newHeight;
        
        if (resizeMode === 'percentage') {
            const scale = parseInt(document.getElementById('scale-percent')?.value || 100) / 100;
            newWidth = img.width * scale;
            newHeight = img.height * scale;
        } else if (resizeMode === 'dimensions') {
            newWidth = parseInt(document.getElementById('width')?.value || 800);
            newHeight = parseInt(document.getElementById('height')?.value || 600);
            
            if (document.getElementById('maintain-aspect')?.checked) {
                const aspectRatio = img.width / img.height;
                if (newWidth / newHeight > aspectRatio) {
                    newWidth = newHeight * aspectRatio;
                } else {
                    newHeight = newWidth / aspectRatio;
                }
            }
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        const format = document.getElementById('output-format')?.value || 'jpg';
        const mimeType = format === 'jpg' ? 'image/jpeg' : 
                        format === 'png' ? 'image/png' : 'image/webp';
        
        canvas.toBlob((blob) => {
            this.createDownloadLink(blob, `resized.${format}`);
            this.updateOutputInfo(`Resized to ${newWidth}×${newHeight} pixels`);
        }, mimeType, 0.9);
    }

    async compressPDF() {
        // Using pdf-lib for PDF compression
        if (!window.PDFLib) {
            this.showError('PDF library not loaded. Please refresh the page.');
            return;
        }
        
        const file = this.currentFiles[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // Compress images
        const pages = pdfDoc.getPages();
        const imageQuality = parseInt(document.getElementById('image-quality')?.value || 75) / 100;
        
        for (const page of pages) {
            const images = page.node.context.enumerateIndirectObjects();
            // Implement image compression logic here
        }
        
        // Remove metadata if selected
        if (document.getElementById('remove-metadata')?.checked) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');
            pdfDoc.setCreationDate(new Date());
            pdfDoc.setModificationDate(new Date());
        }
        
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
        });
        
        const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
        this.createDownloadLink(compressedBlob, 'compressed.pdf');
        
        const originalSize = file.size;
        const compressedSize = compressedBlob.size;
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        this.updateOutputInfo(`
            Original: ${this.formatBytes(originalSize)}<br>
            Compressed: ${this.formatBytes(compressedSize)}<br>
            Reduction: ${reduction}%
        `);
    }

    async removeBackground() {
        // Using OpenCV.js for background removal
        if (!window.cv) {
            this.showError('Computer vision library not loaded. Please wait or refresh.');
            return;
        }
        
        const file = this.currentFiles[0];
        const img = await this.loadImage(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const src = cv.imread(canvas);
        const dst = new cv.Mat();
        const mask = new cv.Mat();
        const bgdModel = new cv.Mat();
        const fgdModel = new cv.Mat();
        const rect = new cv.Rect(50, 50, img.width - 100, img.height - 100);
        
        // GrabCut algorithm for background removal
        cv.grabCut(src, mask, rect, bgdModel, fgdModel, 5, cv.GC_INIT_WITH_RECT);
        
        // Create mask
        const maskValues = new cv.Mat();
        cv.compare(mask, new cv.Scalar(cv.GC_PR_FGD), maskValues, cv.CMP_EQ);
        
        // Apply mask
        const result = new cv.Mat.zeros(src.size(), src.type());
        src.copyTo(result, maskValues);
        
        // Convert to transparent PNG
        const resultCanvas = document.createElement('canvas');
        cv.imshow(resultCanvas, result);
        
        resultCanvas.toBlob((blob) => {
            this.createDownloadLink(blob, 'no-background.png');
            this.updateOutputInfo('Background removed successfully');
            
            // Cleanup
            src.delete(); dst.delete(); mask.delete();
            bgdModel.delete(); fgdModel.delete();
            maskValues.delete(); result.delete();
        }, 'image/png');
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();
            
            reader.onload = (e) => {
                img.src = e.target.result;
                img.onload = () => resolve(img);
                img.onerror = reject;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    createDownloadLink(blob, filename) {
        const downloadBtn = document.getElementById('download-btn');
        const url = URL.createObjectURL(blob);
        
        downloadBtn.disabled = false;
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    }

    updateOutputInfo(html) {
        const outputInfo = document.getElementById('output-info');
        if (outputInfo) {
            outputInfo.innerHTML = html;
        }
    }

    showUploadModal() {
        document.getElementById('upload-modal').style.display = 'flex';
    }

    hideModal() {
        document.getElementById('upload-modal').style.display = 'none';
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PixFlowTools();
    
    // Close modal when clicking X
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('upload-modal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('upload-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Service Worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed:', err));
}
