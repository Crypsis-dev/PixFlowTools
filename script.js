// PixelPerfect Pro - Main Application
class PixelPerfectPro {
    constructor() {
        this.init();
    }
    
    init() {
        this.initTheme();
        this.initMobileMenu();
        this.initPWA();
        this.initToolInteractions();
    }
    
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark');
                const isDark = document.body.classList.contains('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                
                const icon = themeToggle.querySelector('i');
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            });
        }
    }
    
    initMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const menu = document.getElementById('mobileMenu');
        
        if (menuBtn && menu) {
            menuBtn.addEventListener('click', () => {
                menu.classList.toggle('hidden');
                menuBtn.innerHTML = menu.classList.contains('hidden') ? 
                    '<i class="fas fa-bars"></i>' : 
                    '<i class="fas fa-times"></i>';
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
                    menu.classList.add('hidden');
                    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    }
    
    initPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            setTimeout(() => {
                this.showPWAInstallBanner();
            }, 10000);
        });
        
        const installBtn = document.getElementById('pwaInstall');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (!deferredPrompt) return;
                
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.showToast('App installed successfully!', 'success');
                    document.getElementById('pwaBanner').classList.add('hidden');
                }
                
                deferredPrompt = null;
            });
        }
        
        const dismissBtn = document.getElementById('pwaDismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                document.getElementById('pwaBanner').classList.add('hidden');
                localStorage.setItem('pwaBannerDismissed', 'true');
            });
        }
        
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }
    
    showPWAInstallBanner() {
        const banner = document.getElementById('pwaBanner');
        if (banner && !localStorage.getItem('pwaBannerDismissed')) {
            banner.classList.remove('hidden');
        }
    }
    
    initToolInteractions() {
        // Initialize tool-specific functionality if on a tool page
        if (typeof window.converter !== 'undefined') {
            // Tool already initialized
            return;
        }
        
        // Add global file upload functionality
        this.initFileUploads();
    }
    
    initFileUploads() {
        const uploadAreas = document.querySelectorAll('.upload-area');
        
        uploadAreas.forEach(area => {
            const input = area.querySelector('input[type="file"]');
            if (!input) return;
            
            area.addEventListener('click', () => input.click());
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
            });
            area.addEventListener('dragleave', () => {
                area.style.backgroundColor = '';
            });
            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.style.backgroundColor = '';
                this.handleFileDrop(e.dataTransfer.files);
            });
        });
    }
    
    handleFileDrop(files) {
        this.showToast(`Loaded ${files.length} file(s)`, 'success');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Utility functions
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    window.pixelPerfect = new PixelPerfectPro();
});
