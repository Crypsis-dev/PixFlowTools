// PicMagic Pro - Main Application
class PicMagicPro {
    constructor() {
        this.currentTool = null;
        this.files = [];
        this.processing = false;
        this.init();
    }

    init() {
        this.initDarkMode();
        this.initMobileMenu();
        this.initFileUpload();
        this.initToolSelection();
        this.initPWA();
        this.initAdSense();
        this.initToast();
    }

    initDarkMode() {
        const toggle = document.getElementById('dark-mode-toggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        }

        if (toggle) {
            toggle.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                const isDark = document.documentElement.classList.contains('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                this.showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'info');
            });
        }
    }

    initMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        
        if (menuBtn && menu) {
            menuBtn.addEventListener('click', () => {
                menu.classList.toggle('hidden');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
                    menu.classList.add('hidden');
                }
            });
        }
    }

    initFileUpload() {
        const dropZones = document.querySelectorAll('.upload-area');
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        dropZones.forEach(zone => {
            zone.addEventListener('click', () => {
                const input = zone.querySelector('input[type="file"]');
                if (input) input.click();
            });
            
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            });
            
            zone.addEventListener('dragleave', () => {
                zone.style.backgroundColor = '';
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.style.backgroundColor = '';
                const files = Array.from(e.dataTransfer.files);
                this.handleFiles(files);
            });
        });
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFiles(files);
            });
        });
    }

    async handleFiles(files) {
        if (files.length === 0) return;
        
        this.files = files;
        this.showToast(`Loaded ${files.length} file(s)`, 'success');
        
        // Show preview
        if (files[0].type.startsWith('image/')) {
            await this.showImagePreview(files[0]);
        }
        
        // Update file info
        this.updateFileInfo(files);
        
        // Enable process button
        const processBtn = document.getElementById('process-btn');
        if (processBtn) {
            processBtn.disabled = false;
            processBtn.innerHTML = '<i class="fas fa-bolt mr-2"></i>Process Now';
        }
    }

    async showImagePreview(file) {
        const preview = document.getElementById('preview-image');
        if (!preview) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    updateFileInfo(files) {
        const info = document.getElementById('file-info');
        if (!info) return;
        
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        info.innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Files:</span>
                    <span class="font-semibold">${files.length}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Total Size:</span>
                    <span class="font-semibold">${sizeMB} MB</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Type:</span>
                    <span class="font-semibold">${files[0].type.split('/')[1].toUpperCase()}</span>
                </div>
            </div>
        `;
    }

    initToolSelection() {
        const toolLinks = document.querySelectorAll('[data-tool]');
        toolLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toolId = link.dataset.tool;
                this.loadTool(toolId);
            });
        });
    }

    loadTool(toolId) {
        this.currentTool = toolId;
        window.location.href = `${toolId}.html`;
    }

    // Image to PDF Converter
    async convertImagesToPDF() {
        if (this.files.length === 0) {
            this.showToast('Please upload images first', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            const pageSize = document.getElementById('page-size')?.value || 'a4';
            const orientation = document.getElementById('orientation')?.value || 'portrait';
            
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
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
            this.downloadFile(pdfBlob, 'converted.pdf');
            this.showToast('PDF created successfully!', 'success');
            
        } catch (error) {
            console.error('Error converting to PDF:', error);
            this.showToast('Failed to create PDF', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Image Resizer
    async resizeImage() {
        if (this.files.length === 0) {
            this.showToast('Please upload an image first', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const file = this.files[0];
            const img = await this.loadImage(file);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const widthInput = document.getElementById('width');
            const heightInput = document.getElementById('height');
            const maintainAspect = document.getElementById('maintain-aspect')?.checked;
            
            let newWidth = parseInt(widthInput?.value || img.width);
            let newHeight = parseInt(heightInput?.value || img.height);
            
            if (maintainAspect) {
                const aspectRatio = img.width / img.height;
                if (newWidth / newHeight > aspectRatio) {
                    newWidth = newHeight * aspectRatio;
                } else {
                    newHeight = newWidth / aspectRatio;
                }
            }
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // Use high-quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            const format = document.getElementById('output-format')?.value || 'jpg';
            const quality = parseFloat(document.getElementById('quality')?.value || 0.9);
            const mimeType = format === 'jpg' ? 'image/jpeg' : 
                           format === 'png' ? 'image/png' : 'image/webp';
            
            canvas.toBlob((blob) => {
                this.downloadFile(blob, `resized.${format}`);
                this.showToast(`Image resized to ${newWidth}×${newHeight}`, 'success');
            }, mimeType, quality);
            
        } catch (error) {
            console.error('Error resizing image:', error);
            this.showToast('Failed to resize image', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // PDF Compressor
    async compressPDF() {
        if (this.files.length === 0) {
            this.showToast('Please upload a PDF first', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const file = this.files[0];
            const arrayBuffer = await file.arrayBuffer();
            
            // Load PDF using pdf-lib
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            
            // Get compression settings
            const compressImages = document.getElementById('compress-images')?.checked;
            const imageQuality = parseFloat(document.getElementById('image-quality')?.value || 0.8);
            const removeMetadata = document.getElementById('remove-metadata')?.checked;
            
            if (removeMetadata) {
                // Remove metadata
                pdfDoc.setTitle('');
                pdfDoc.setAuthor('');
                pdfDoc.setSubject('');
                pdfDoc.setKeywords([]);
                pdfDoc.setProducer('');
                pdfDoc.setCreator('');
                pdfDoc.setCreationDate(new Date());
                pdfDoc.setModificationDate(new Date());
            }
            
            // Save with compression
            const compressedBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
            });
            
            const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
            
            // Calculate compression ratio
            const originalSize = file.size;
            const compressedSize = compressedBlob.size;
            const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
            
            this.downloadFile(compressedBlob, 'compressed.pdf');
            this.showToast(`PDF compressed by ${reduction}%`, 'success');
            
        } catch (error) {
            console.error('Error compressing PDF:', error);
            this.showToast('Failed to compress PDF', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Background Remover (using AI)
    async removeBackground() {
        if (this.files.length === 0) {
            this.showToast('Please upload an image first', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const file = this.files[0];
            const img = await this.loadImage(file);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Simple background removal algorithm
            // For production, use a proper AI model like rembg
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Simple chroma key removal (for demo)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Remove white/gray backgrounds
                if (r > 240 && g > 240 && b > 240) {
                    data[i + 3] = 0; // Set alpha to 0
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            canvas.toBlob((blob) => {
                this.downloadFile(blob, 'no-background.png');
                this.showToast('Background removed successfully!', 'success');
            }, 'image/png');
            
        } catch (error) {
            console.error('Error removing background:', error);
            this.showToast('Failed to remove background', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Helper Methods
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

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const content = document.getElementById('content');
        
        if (loading && content) {
            if (show) {
                loading.classList.remove('hidden');
                content.classList.add('opacity-50', 'pointer-events-none');
            } else {
                loading.classList.add('hidden');
                content.classList.remove('opacity-50', 'pointer-events-none');
            }
        }
    }

    initToast() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const colors = {
            success: 'bg-green-500 border-green-600',
            error: 'bg-red-500 border-red-600',
            info: 'bg-blue-500 border-blue-600',
            warning: 'bg-yellow-500 border-yellow-600'
        };
        
        toast.className = `text-white px-4 py-3 rounded-lg shadow-lg border-l-4 ${colors[type]} animate-fadeIn`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    initPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install banner after 10 seconds
            setTimeout(() => {
                this.showInstallBanner();
            }, 10000);
        });
        
        // Install button
        const installBtn = document.getElementById('pwa-install');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (!deferredPrompt) return;
                
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.showToast('App installed successfully!', 'success');
                    document.getElementById('pwa-banner').classList.add('hidden');
                }
                
                deferredPrompt = null;
            });
        }
        
        // Dismiss button
        const dismissBtn = document.getElementById('pwa-dismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                document.getElementById('pwa-banner').classList.add('hidden');
            });
        }
        
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }

    showInstallBanner() {
        const banner = document.getElementById('pwa-banner');
        if (banner && !localStorage.getItem('pwaBannerDismissed')) {
            banner.classList.remove('hidden');
            banner.classList.add('animate-fadeIn');
        }
    }

    initAdSense() {
        // Auto ads are already in the head
        // Initialize any additional ad placements
        window.adsbygoogle = window.adsbygoogle || [];
    }

    // Format bytes to human readable
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Copy to clipboard
    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.showToast('Copied to clipboard!', 'success'))
            .catch(() => this.showToast('Failed to copy', 'error'));
    }
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    window.picMagic = new PicMagicPro();
});
