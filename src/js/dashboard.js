document.addEventListener('DOMContentLoaded', () => {
    // Cek Autentikasi
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Dark Mode Initialization
    const themeToggleBtn = document.getElementById('themeToggle');
    const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) document.documentElement.classList.add('dark');
    updateThemeIcon();

    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon();
        initCharts(); // Redraw charts with correct colors
    });

    function updateThemeIcon() {
        const isDark = document.documentElement.classList.contains('dark');
        themeToggleBtn.innerHTML = isDark ? '<i class="fas fa-sun text-lg"></i>' : '<i class="fas fa-moon text-lg"></i>';
    }

    // Setup User Info & Roles
    const role = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName') || 'User';
    
    document.getElementById('userNameDisplay').innerText = userName;
    if(document.getElementById('heroUserName')) document.getElementById('heroUserName').innerText = userName;
    document.getElementById('userRoleDisplay').innerText = role;
    document.getElementById('userAvatarImg').src = `https://ui-avatars.com/api/?name=${userName}&background=2563EB&color=fff&rounded=true`;

    // Sembunyikan fitur admin jika bukan Super Admin
    if (role !== 'Super Admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
    if (role === 'Viewer') {
        document.querySelectorAll('.admin-manager-only').forEach(el => el.style.display = 'none');
    }

    // Current Date Display
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('id-ID', dateOptions);

    // Navigation Routing
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            const target = item.getAttribute('data-target');
            
            views.forEach(v => v.classList.add('hidden'));
            
            // Add slight fade-in animation
            const targetEl = document.getElementById(target);
            targetEl.classList.remove('hidden');
            targetEl.style.opacity = 0;
            setTimeout(() => targetEl.style.opacity = 1, 50);
            
            // Invalidate Map Size if shown to fix Leaflet rendering bug
            if(target === 'view-overview' && map) {
                setTimeout(() => map.invalidateSize(), 100);
            }
        });
    });

    // Init Charts
    initCharts();

    // Render Project Cards
    renderProjectCards();
    
    // Initialize Leaflet Map
    initMap();

    // Logout Handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        Swal.fire({
            title: 'Keluar dari Sistem?',
            text: "Sesi anda akan diakhiri.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'Ya, Logout',
            background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });
    });
});

// Mock Data Proyek
const mockProjects = [
    {
        id: 1, name: "Gedung Metropolitan Tower", location: "Jakarta Selatan", client: "PT Megah Jaya",
        pic: "Budi Santoso", value: "Rp 45 M", start: "10 Jan 2024", end: "30 Des 2024",
        status: "Berjalan", progress: 68, coords: [-6.2088, 106.8456],
        tasks: [
            { name: "Persiapan & Pembersihan", p: 100 }, { name: "Struktur Pondasi", p: 100 },
            { name: "Konstruksi Arsitektur", p: 75 }, { name: "Instalasi MEP", p: 40 },
            { name: "Finishing Interior", p: 0 }
        ]
    },
    {
        id: 2, name: "Jembatan Interkoneksi", location: "Surabaya", client: "Pemprov Jatim",
        pic: "Siti Rahma", value: "Rp 85 M", start: "01 Mar 2024", end: "30 Jun 2025",
        status: "Perencanaan", progress: 15, coords: [-7.2504, 112.7688],
        tasks: [
            { name: "Persiapan Lahan", p: 80 }, { name: "Pondasi Pancang", p: 10 },
            { name: "Struktur Baja", p: 0 }, { name: "Pengecoran", p: 0 }
        ]
    },
    {
        id: 3, name: "Pabrik Manufaktur Otomatis", location: "Karawang", client: "PT Indo Tech",
        pic: "Ahmad Wijaya", value: "Rp 120 M", start: "15 Jun 2023", end: "15 Mei 2024",
        status: "Selesai", progress: 100, coords: [-6.3024, 107.2950],
        tasks: [
            { name: "Persiapan", p: 100 }, { name: "Struktur", p: 100 },
            { name: "Arsitektur", p: 100 }, { name: "MEP & Otomasi", p: 100 }
        ]
    }
];

let map;
function initMap() {
    map = L.map('projectMap').setView([-6.5, 107.0], 8);
    // CartoDB Positron Base map - modern and clean
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);
    
    mockProjects.forEach(p => {
        let color = p.status === 'Selesai' ? 'green' : (p.status === 'Berjalan' ? 'blue' : 'orange');
        let markerHtml = `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`;
        let icon = L.divIcon({ html: markerHtml, className: '' });
        
        L.marker(p.coords, { icon }).addTo(map).bindPopup(`<b>${p.name}</b><br>Progress: ${p.progress}%`);
    });
}

function getColor(p, format = 'class') {
    if (format === 'hex') {
        if(p <= 25) return '#EF4444'; if(p <= 50) return '#F59E0B'; if(p <= 75) return '#3B82F6'; return '#22C55E';
    }
    if(p <= 25) return 'text-red-500'; if(p <= 50) return 'text-amber-500'; if(p <= 75) return 'text-blue-500'; return 'text-green-500';
}

function getBgColor(p) {
    if(p <= 25) return 'bg-red-500'; if(p <= 50) return 'bg-amber-500'; if(p <= 75) return 'bg-blue-500'; return 'bg-green-500';
}

function renderProjectCards() {
    const container = document.getElementById('projectsGrid');
    const isViewer = localStorage.getItem('userRole') === 'Viewer';
    
    container.innerHTML = mockProjects.map(p => {
        const statusBadge = p.status === 'Selesai' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 
                            (p.status === 'Berjalan' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 
                            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400');
                            
        const offset = 175 - (175 * p.progress) / 100; // 175 is approx circumference of r=28
        
        return `
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group" onclick="viewDetail(${p.id})">
            <div class="flex justify-between items-start mb-4">
                <span class="px-3 py-1 rounded-lg text-xs font-bold ${statusBadge}">${p.status}</span>
                ${!isViewer ? `<button class="text-slate-400 hover:text-blue-500 transition-colors z-10" onclick="event.stopPropagation(); alert('Edit Project')"><i class="fas fa-edit"></i></button>` : ''}
            </div>
            
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">${p.name}</h3>
            <p class="text-slate-500 dark:text-slate-400 text-sm mb-6"><i class="fas fa-map-marker-alt mr-1"></i> ${p.location}</p>
            
            <div class="flex items-center justify-between mt-4">
                <div>
                    <p class="text-xs text-slate-400 mb-1 uppercase font-semibold tracking-wider">Deadline</p>
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">${p.end}</p>
                </div>
                <div class="relative">
                    <svg class="w-16 h-16 circle-progress">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="6" fill="transparent" class="text-slate-100 dark:text-slate-700" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="6" fill="transparent" stroke-dasharray="175" stroke-dashoffset="${offset}" class="${getColor(p.progress)}" stroke-linecap="round" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-sm font-bold text-slate-700 dark:text-white">${p.progress}%</span>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

window.viewDetail = function(id) {
    const p = mockProjects.find(x => x.id === id);
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-project-detail').classList.remove('hidden');
    
    document.getElementById('detail-name').innerText = p.name;
    document.getElementById('detail-status').innerHTML = `<span class="px-3 py-1 text-xs font-bold rounded-lg ${p.status === 'Selesai' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : (p.status === 'Berjalan' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400')}">${p.status}</span>`;
    
    document.getElementById('detail-info').innerHTML = `
        <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50"><span class="text-slate-500">Klien</span><span class="font-semibold text-slate-800 dark:text-slate-200">${p.client}</span></div>
        <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50"><span class="text-slate-500">Lokasi</span><span class="font-semibold text-slate-800 dark:text-slate-200">${p.location}</span></div>
        <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50"><span class="text-slate-500">PIC</span><span class="font-semibold text-slate-800 dark:text-slate-200">${p.pic}</span></div>
        <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50"><span class="text-slate-500">Nilai Anggaran</span><span class="font-bold text-blue-600 dark:text-blue-400">${p.value}</span></div>
        <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50"><span class="text-slate-500">Mulai</span><span class="font-semibold text-slate-800 dark:text-slate-200">${p.start}</span></div>
        <div class="flex justify-between py-2"><span class="text-slate-500">Target Selesai</span><span class="font-semibold text-slate-800 dark:text-slate-200">${p.end}</span></div>
    `;

    document.getElementById('detail-tasks').innerHTML = p.tasks.map(t => `
        <div>
            <div class="flex justify-between text-sm mb-2"><span class="font-semibold text-slate-700 dark:text-slate-300">${t.name}</span><span class="font-bold ${getColor(t.p)}">${t.p}%</span></div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden"><div class="${getBgColor(t.p)} h-full rounded-full transition-all duration-1000" style="width: ${t.p}%"></div></div>
        </div>
    `).join('');

    document.getElementById('detail-timeline-horizontal').innerHTML = p.tasks.map((t, i) => `
        <div class="flex flex-col items-center flex-1 relative min-w-[80px]">
            ${i !== p.tasks.length - 1 ? `<div class="absolute top-4 left-1/2 w-full h-1 ${t.p === 100 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'} -z-10"></div>` : ''}
            <div class="w-8 h-8 rounded-full flex items-center justify-center mb-3 shadow-md ${t.p === 100 ? 'bg-green-500 text-white' : (t.p > 0 ? 'bg-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-300')}">
                <i class="fas ${t.p === 100 ? 'fa-check' : (t.p > 0 ? 'fa-spinner fa-spin' : 'fa-circle')} text-xs"></i>
            </div>
            <h4 class="text-xs font-bold text-center text-slate-800 dark:text-slate-200 leading-tight">${t.name}</h4>
        </div>
    `).join('');
};

window.switchView = function(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    const targetEl = document.getElementById(viewId);
    targetEl.classList.remove('hidden');
    targetEl.style.opacity = 0;
    setTimeout(() => targetEl.style.opacity = 1, 50);
}

let chartsInstance = [];
function initCharts() {
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    // Destroy existing instances if changing themes
    chartsInstance.forEach(c => c.destroy());
    chartsInstance = [];

    const lineCtx = document.getElementById('lineChart');
    if(lineCtx) {
        chartsInstance.push(new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                datasets: [{ label: 'Progress Keseluruhan (%)', data: [15, 30, 45, 55, 65, 68], borderColor: '#2563EB', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#2563EB', borderWidth: 3 }]
            },
            options: { 
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                }
            }
        }));
    }
    const pieCtx = document.getElementById('pieChart');
    if(pieCtx) {
        chartsInstance.push(new Chart(pieCtx, { 
            type: 'doughnut', 
            data: { labels: ['Berjalan', 'Selesai', 'Tertunda'], datasets: [{ data: [12, 24, 1], backgroundColor: ['#3B82F6', '#22C55E', '#EF4444'], borderWidth: 0 }] }, 
            options: { 
                responsive: true, maintainAspectRatio: false, cutout: '75%',
                plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 20, usePointStyle: true } } }
            } 
        }));
    }
}

// Modal & Utilities
window.openModal = id => { document.getElementById(id).classList.remove('hidden'); document.getElementById(id).classList.add('flex'); };
window.closeModal = id => { document.getElementById(id).classList.add('hidden'); document.getElementById(id).classList.remove('flex'); };

window.saveProject = function() {
    closeModal('modalProject');
    const isDark = document.documentElement.classList.contains('dark');
    Swal.fire({ icon: 'success', title: 'Berhasil Deployed', text: 'Sistem proyek baru berhasil dibuat.', confirmButtonColor: '#2563EB', background: isDark ? '#1E293B' : '#fff', color: isDark ? '#fff' : '#1E293B' });
};

window.generateReport = function() {
    const isDark = document.documentElement.classList.contains('dark');
    Swal.fire({ title: 'Kompilasi Data...', text: 'Menyiapkan dokumen laporan analitik anda', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: isDark ? '#1E293B' : '#fff', color: isDark ? '#fff' : '#1E293B' });
    setTimeout(() => {
        Swal.fire({ icon: 'success', title: 'Export Berhasil', text: 'Laporan telah diunduh ke perangkat Anda.', confirmButtonColor: '#2563EB', background: isDark ? '#1E293B' : '#fff', color: isDark ? '#fff' : '#1E293B' });
    }, 2000);
};

window.viewPhoto = function(url) {
    Swal.fire({ imageUrl: url, imageWidth: '100%', imageAlt: 'Dokumentasi', showConfirmButton: false, background: 'transparent', backdrop: 'rgba(0,0,0,0.85)' });
};