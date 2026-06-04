document.addEventListener('DOMContentLoaded', () => {
    // Cek Autentikasi
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // --- INJECT ENTERPRISE DARK & ORANGE THEME GLOBALLY ---
    const enterpriseTheme = document.createElement('style');
    enterpriseTheme.innerHTML = `
        :root {
            --bg-dark: #0A0A0A;
            --surface-dark: #121212;
            --card-dark: #1A1A1A;
            --border-dark: #2A2A2A;
            --primary-orange: #FF7A00;
            --secondary-orange: #FFA726;
            --text-main: #FFFFFF;
            --text-muted: #A1A1AA;
        }
        body, .dark body { background-color: var(--bg-dark) !important; color: var(--text-main) !important; }
        /* Premium Sidebar */
        aside { background: rgba(18,18,18,0.7) !important; backdrop-filter: blur(24px) !important; border-right: 1px solid var(--border-dark) !important; }
        aside a.active { background: linear-gradient(90deg, rgba(255,122,0,0.15) 0%, transparent 100%) !important; border-left: 3px solid var(--primary-orange) !important; color: var(--primary-orange) !important; text-shadow: 0 0 12px rgba(255,122,0,0.6); }
        aside a:hover:not(.active) { color: var(--secondary-orange) !important; background: rgba(255,122,0,0.05) !important; }
        /* Floating Topbar */
        header { background: rgba(18,18,18,0.8) !important; backdrop-filter: blur(20px) !important; border-bottom: 1px solid var(--border-dark) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; }
        /* Hero & Cards global fixes */
        .bg-white, .dark .bg-slate-800, .bg-slate-50 { background-color: var(--card-dark) !important; border-color: var(--border-dark) !important; }
        .text-slate-800, .text-slate-900, .text-slate-700 { color: var(--text-main) !important; }
        .text-slate-500, .text-slate-400 { color: var(--text-muted) !important; }
        .border-slate-100, .dark .border-slate-700 { border-color: var(--border-dark) !important; }
        /* Glass Input */
        input, select, textarea { background-color: var(--surface-dark) !important; border: 1px solid var(--border-dark) !important; color: var(--text-main) !important; }
        input:focus, select:focus, textarea:focus { border-color: var(--primary-orange) !important; box-shadow: 0 0 0 2px rgba(255,122,0,0.2) !important; }
        /* Buttons Glow */
        .bg-blue-600, .bg-blue-500, .bg-orange-500 { background: var(--primary-orange) !important; color: #fff !important; box-shadow: 0 0 12px rgba(255,122,0,0.3) !important; border: 1px solid rgba(255,122,0,0.5) !important; }
        .bg-blue-600:hover, .bg-blue-500:hover, .bg-orange-500:hover { background: var(--secondary-orange) !important; box-shadow: 0 0 24px rgba(255,122,0,0.6) !important; }
        /* Hero Subtext Glow */
        #heroUserName { color: var(--primary-orange) !important; text-shadow: 0 0 10px rgba(255,122,0,0.4); }
    `;
    document.head.appendChild(enterpriseTheme);

    // Dark Mode Initialization
    const themeToggleBtn = document.getElementById('themeToggle');
    
    // Default ke tema dark (hitam)
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
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
    document.getElementById('userAvatarImg').src = `https://ui-avatars.com/api/?name=${userName}&background=FF7A00&color=fff&rounded=true`;

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
            confirmButtonColor: '#FF7A00',
            cancelButtonColor: '#2A2A2A',
            confirmButtonText: 'Ya, Logout',
            background: '#1A1A1A',
            color: '#FFFFFF'
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
        status: "Berjalan", progress: 63, divSipil: 80, divArs: 60, divMep: 48, coords: [-6.2088, 106.8456],
        weeklyUpdates: { 24: { sipil: 80, ars: 60, mep: 48, total: 63, note: "Pengecoran area parkir timur selesai." } },
        tasks: [
            { name: "Persiapan & Pembersihan", p: 100 }, { name: "Struktur Pondasi", p: 100 },
            { name: "Konstruksi Arsitektur", p: 75 }, { name: "Instalasi MEP", p: 40 },
            { name: "Finishing Interior", p: 0 }
        ]
    },
    {
        id: 2, name: "Jembatan Interkoneksi", location: "Surabaya", client: "Pemprov Jatim",
        pic: "Siti Rahma", value: "Rp 85 M", start: "01 Mar 2024", end: "30 Jun 2025",
        status: "Perencanaan", progress: 13, divSipil: 30, divArs: 10, divMep: 0, coords: [-7.2504, 112.7688],
        weeklyUpdates: { 5: { sipil: 30, ars: 10, mep: 0, total: 13, note: "Pembersihan lahan tahap 1." } },
        tasks: [
            { name: "Persiapan Lahan", p: 80 }, { name: "Pondasi Pancang", p: 10 },
            { name: "Struktur Baja", p: 0 }, { name: "Pengecoran", p: 0 }
        ]
    },
    {
        id: 3, name: "Pabrik Manufaktur Otomatis", location: "Karawang", client: "PT Indo Tech",
        pic: "Ahmad Wijaya", value: "Rp 120 M", start: "15 Jun 2023", end: "15 Mei 2024",
        status: "Selesai", progress: 100, divSipil: 100, divArs: 100, divMep: 100, coords: [-6.3024, 107.2950],
        weeklyUpdates: { 25: { sipil: 100, ars: 100, mep: 100, total: 100, note: "Serah terima proyek." } },
        tasks: [
            { name: "Persiapan", p: 100 }, { name: "Struktur", p: 100 },
            { name: "Arsitektur", p: 100 }, { name: "MEP & Otomasi", p: 100 }
        ]
    }
];

let map;
function initMap() {
    map = L.map('projectMap').setView([-6.5, 107.0], 8);
    // CartoDB Dark Matter Base map - premium dark industrial
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);
    
    mockProjects.forEach(p => {
        let color = p.status === 'Selesai' ? '#22C55E' : (p.status === 'Berjalan' ? '#FF7A00' : '#EF4444');
        let glow = p.status === 'Berjalan' ? 'box-shadow: 0 0 15px 4px rgba(255,122,0,0.6);' : 'box-shadow: 0 0 4px rgba(0,0,0,0.8);';
        let markerHtml = `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #1A1A1A; ${glow}"></div>`;
        let icon = L.divIcon({ html: markerHtml, className: '' });
        
        L.marker(p.coords, { icon }).addTo(map).bindPopup(`<b>${p.name}</b><br>Progress: ${p.progress}%`);
    });
}

function getColor(p, format = 'class') {
    if (format === 'hex') {
        if(p <= 25) return '#EF4444'; if(p <= 50) return '#FFA726'; if(p <= 75) return '#FF7A00'; return '#22C55E';
    }
    if(p <= 25) return 'text-[#EF4444]'; if(p <= 50) return 'text-[#FFA726]'; if(p <= 75) return 'text-[#FF7A00]'; return 'text-[#22C55E]';
}

function getBgColor(p) {
    if(p <= 25) return 'bg-red-500'; if(p <= 50) return 'bg-amber-500'; if(p <= 75) return 'bg-orange-500'; return 'bg-green-500';
    if(p <= 25) return 'bg-[#EF4444]'; if(p <= 50) return 'bg-[#FFA726]'; if(p <= 75) return 'bg-[#FF7A00]'; return 'bg-[#22C55E]';
}

function renderProjectCards() {
    const container = document.getElementById('projectsGrid');
    const isViewer = localStorage.getItem('userRole') === 'Viewer';
    
    container.innerHTML = mockProjects.map(p => {
        const statusBadge = p.status === 'Selesai' ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20' : 
                            (p.status === 'Berjalan' ? 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 shadow-[0_0_15px_rgba(255,122,0,0.2)]' : 
                            'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20');
                            
        const offset = 175 - (175 * p.progress) / 100; // 175 is approx circumference of r=28
        
        return `
        <div class="bg-[#1A1A1A] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-[#2A2A2A] hover:border-[#FF7A00]/50 hover:shadow-[0_8px_30px_rgba(255,122,0,0.15)] transition-all duration-300 cursor-pointer relative overflow-hidden group" onclick="viewDetail(${p.id})">
            
            <!-- Ambient Glow -->
            <div class="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-[#FF7A00] rounded-full opacity-0 group-hover:opacity-[0.15] blur-3xl transition-opacity duration-500"></div>

            <div class="flex justify-between items-start mb-4 relative z-10">
                <span class="px-3 py-1 rounded-lg text-xs font-bold ${statusBadge}">${p.status}</span>
                ${!isViewer ? `<button class="text-[#A1A1AA] hover:text-[#FF7A00] transition-colors z-10 drop-shadow-md" onclick="event.stopPropagation(); alert('Edit Project')"><i class="fas fa-edit"></i></button>` : ''}
            </div>
            
            <h3 class="text-lg font-bold text-[#FFFFFF] mb-1 group-hover:text-[#FF7A00] transition-colors relative z-10">${p.name}</h3>
            <p class="text-[#A1A1AA] text-sm mb-6 relative z-10"><i class="fas fa-map-marker-alt mr-1 text-[#FF7A00]/70"></i> ${p.location}</p>
            
            <div class="flex items-center justify-between mt-4 border-t border-[#2A2A2A] pt-4 relative z-10">
                <div>
                    <p class="text-xs text-[#A1A1AA] mb-1 uppercase font-semibold tracking-wider">Deadline</p>
                    <p class="text-sm font-semibold text-[#FFFFFF]">${p.end}</p>
                </div>
                <div class="relative">
                    <svg class="w-16 h-16 circle-progress drop-shadow-md">
                        <circle cx="32" cy="32" r="28" stroke="#2A2A2A" stroke-width="6" fill="transparent" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="6" fill="transparent" stroke-dasharray="175" stroke-dashoffset="${offset}" class="${getColor(p.progress)}" stroke-linecap="round" style="filter: drop-shadow(0 0 4px currentColor);" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-sm font-bold text-[#FFFFFF]">${p.progress}%</span>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

window.viewDetail = function(id) {
    const p = mockProjects.find(x => x.id === id);
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    const detailView = document.getElementById('view-project-detail');
    detailView.classList.remove('hidden');
    detailView.style.opacity = 0;
    setTimeout(() => detailView.style.opacity = 1, 50);

    // Ambil Data Divisi Aktual
    const divSipil = p.divSipil || 0;
    const divArs = p.divArs || 0;
    const divMep = p.divMep || 0;
    const dashOffset = 440 - (440 * p.progress) / 100;
    
    // Generate Log History secara Dinamis dari Data Update
    let logHtml = '';
    if (p.weeklyUpdates && Object.keys(p.weeklyUpdates).length > 0) {
        const weeks = Object.keys(p.weeklyUpdates).map(Number).sort((a, b) => b - a);
        logHtml = weeks.map((w, i) => {
            const data = p.weeklyUpdates[w];
            const isLatest = i === 0;
            return `
                <div class="relative pl-6">
                    <div class="absolute w-3.5 h-3.5 ${isLatest ? 'bg-[#FF7A00] shadow-[0_0_10px_#FF7A00]' : 'bg-[#2A2A2A]'} rounded-full -left-[8.5px] top-1"></div>
                    <p class="text-xs ${isLatest ? 'text-[#FF7A00]' : 'text-[#A1A1AA]'} font-semibold mb-1">Update Minggu ke-${w}</p>
                    <p class="text-sm text-white font-medium">Total: ${data.total}% <span class="text-xs text-[#A1A1AA] font-normal">(Sipil: ${data.sipil}%, Ars: ${data.ars}%, MEP: ${data.mep}%)</span></p>
                    ${data.note ? `<p class="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed bg-[#121212] p-2.5 rounded-lg border border-[#2A2A2A]">${data.note}</p>` : ''}
                </div>
            `;
        }).join('');
    } else {
        logHtml = `<p class="text-sm text-[#A1A1AA] italic">Belum ada catatan update.</p>`;
    }

    detailView.innerHTML = `
        <!-- Header & Toolbar -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div class="flex items-center gap-4">
                <button onclick="closeProjectDetail()" class="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#A1A1AA] hover:text-[#FF7A00] hover:border-[#FF7A00] hover:shadow-[0_0_10px_rgba(255,122,0,0.3)] flex items-center justify-center transition-all">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <div>
                    <h2 class="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        ${p.name}
                        <span class="px-3 py-1 text-xs font-bold rounded-lg ${p.status === 'Selesai' ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20' : (p.status === 'Berjalan' ? 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 shadow-[0_0_10px_rgba(255,122,0,0.2)]' : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20')}">${p.status}</span>
                    </h2>
                    <p class="text-[#A1A1AA] text-sm"><i class="fas fa-map-marker-alt text-[#FF7A00] mr-2"></i>${p.location}</p>
                </div>
            </div>
            <div class="flex flex-wrap gap-3">
                <button onclick="updateProgressSystem(${p.id})" class="px-4 py-2 rounded-lg bg-[#121212] border border-[#2A2A2A] text-[#FFFFFF] hover:border-[#FF7A00] hover:text-[#FF7A00] transition-all text-sm font-semibold flex items-center gap-2">
                    <i class="fas fa-sync-alt"></i> Update Progress
                </button>
                <button onclick="alert('Upload Dokumentasi Lapangan')" class="px-4 py-2 rounded-lg bg-[#121212] border border-[#2A2A2A] text-[#FFFFFF] hover:border-[#FF7A00] hover:text-[#FF7A00] transition-all text-sm font-semibold flex items-center gap-2">
                    <i class="fas fa-camera"></i> Upload
                </button>
                <button onclick="generateReport()" class="px-4 py-2 rounded-lg bg-[#FF7A00] hover:bg-[#FFA726] text-white shadow-[0_0_15px_rgba(255,122,0,0.4)] transition-all text-sm font-bold flex items-center gap-2">
                    <i class="fas fa-file-export"></i> Export Report
                </button>
            </div>
        </div>

        <!-- Main Interface Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-10">
            
            <!-- Left / Main Panel (Span 2) -->
            <div class="xl:col-span-2 space-y-6">
                
                <!-- Analytics Overview -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Circular Overall Progress -->
                    <div class="bg-[#1A1A1A]/80 backdrop-blur-md rounded-2xl p-6 border border-[#2A2A2A] flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FF7A00]/30 transition-all">
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#FF7A00] rounded-full opacity-[0.05] group-hover:opacity-[0.15] blur-3xl transition-opacity"></div>
                        <h3 class="text-[#A1A1AA] text-sm font-semibold uppercase tracking-wider mb-6">Progress Keseluruhan</h3>
                        <div class="relative w-44 h-44">
                            <svg class="w-full h-full transform -rotate-90 drop-shadow-xl">
                                <circle cx="88" cy="88" r="70" stroke="#2A2A2A" stroke-width="12" fill="transparent" />
                                <circle cx="88" cy="88" r="70" stroke="currentColor" stroke-width="12" fill="transparent" stroke-dasharray="440" stroke-dashoffset="${dashOffset}" class="${getColor(p.progress)}" stroke-linecap="round" style="filter: drop-shadow(0 0 8px currentColor); transition: stroke-dashoffset 2s ease-out;" />
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">${p.progress}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Project Information Card -->
                    <div class="bg-[#1A1A1A]/80 backdrop-blur-md rounded-2xl p-6 border border-[#2A2A2A] relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-[#FF7A00] rounded-full opacity-[0.03] blur-2xl"></div>
                        <h3 class="text-[#A1A1AA] text-sm font-semibold uppercase tracking-wider mb-4">Informasi Proyek</h3>
                        <div class="space-y-4 relative z-10">
                            <div class="flex justify-between items-center border-b border-[#2A2A2A] pb-3"><span class="text-[#A1A1AA] text-sm"><i class="fas fa-building mr-2 text-center w-5"></i>Klien</span><span class="text-white font-semibold text-right">${p.client}</span></div>
                            <div class="flex justify-between items-center border-b border-[#2A2A2A] pb-3"><span class="text-[#A1A1AA] text-sm"><i class="fas fa-user-tie mr-2 text-center w-5"></i>Project Manager</span><span class="text-white font-semibold text-right">${p.pic}</span></div>
                            <div class="flex justify-between items-center border-b border-[#2A2A2A] pb-3"><span class="text-[#A1A1AA] text-sm"><i class="fas fa-money-bill-wave mr-2 text-center w-5"></i>Anggaran</span><span class="text-[#FF7A00] font-bold drop-shadow-[0_0_5px_rgba(255,122,0,0.5)] text-right">${p.value}</span></div>
                            <div class="flex justify-between items-center"><span class="text-[#A1A1AA] text-sm"><i class="fas fa-calendar-alt mr-2 text-center w-5"></i>Deadline</span><span class="text-white font-semibold text-right">${p.end}</span></div>
                        </div>
                    </div>
                </div>

                <!-- Division & Milestones Area -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Division Progress Bars -->
                    <div class="bg-[#1A1A1A]/80 backdrop-blur-md rounded-2xl p-6 border border-[#2A2A2A]">
                        <h3 class="text-[#A1A1AA] text-sm font-semibold uppercase tracking-wider mb-5">Progress Per Divisi</h3>
                        <div class="space-y-6">
                            <div><div class="flex justify-between text-sm mb-2"><span class="text-white font-medium">Sipil & Struktur</span><span class="font-bold text-[#FF7A00]">${divSipil}%</span></div><div class="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-full h-2.5 overflow-hidden"><div class="bg-[#FF7A00] h-full rounded-full shadow-[0_0_8px_#FF7A00]" style="width: ${divSipil}%"></div></div></div>
                            <div><div class="flex justify-between text-sm mb-2"><span class="text-white font-medium">Arsitektur & Interior</span><span class="font-bold text-[#FFA726]">${divArs}%</span></div><div class="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-full h-2.5 overflow-hidden"><div class="bg-[#FFA726] h-full rounded-full shadow-[0_0_8px_#FFA726]" style="width: ${divArs}%"></div></div></div>
                            <div><div class="flex justify-between text-sm mb-2"><span class="text-white font-medium">MEP (Mekanikal Elektrikal)</span><span class="font-bold text-[#F59E0B]">${divMep}%</span></div><div class="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-full h-2.5 overflow-hidden"><div class="bg-[#F59E0B] h-full rounded-full shadow-[0_0_8px_#F59E0B]" style="width: ${divMep}%"></div></div></div>
                        </div>
                    </div>

                    <!-- M1 - M5 Timeline -->
                    <div class="bg-[#1A1A1A]/80 backdrop-blur-md rounded-2xl p-6 border border-[#2A2A2A] flex flex-col">
                        <h3 class="text-[#A1A1AA] text-sm font-semibold uppercase tracking-wider mb-auto">Milestone Timeline</h3>
                        <div class="flex justify-between items-center relative mt-8 mb-4">
                            <div class="absolute top-[15px] left-[5%] w-[90%] h-[3px] bg-[#2A2A2A] -z-10"></div>
                            ${[1,2,3,4,5].map(m => {
                                const mProg = p.progress / 100 * 5; 
                                const isDone = mProg >= m;
                                const isCurrent = mProg >= m - 1 && mProg < m;
                                const btnClass = isDone ? 'bg-[#22C55E] text-white shadow-[0_0_10px_rgba(34,197,94,0.5)] border-transparent' : (isCurrent ? 'bg-[#121212] text-[#FF7A00] border-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.6)]' : 'bg-[#121212] border-[#2A2A2A] text-[#A1A1AA]');
                                return `<div class="flex flex-col items-center group cursor-pointer relative"><div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${btnClass}">${isDone ? '<i class="fas fa-check"></i>' : 'M'+m}</div><span class="text-[11px] mt-3 font-medium ${isDone || isCurrent ? 'text-white' : 'text-[#A1A1AA]'}">Tahap ${m}</span></div>`
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Weekly Progress Chart -->
                <div class="bg-[#1A1A1A]/80 backdrop-blur-md rounded-2xl p-6 border border-[#2A2A2A]">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-[#A1A1AA] text-sm font-semibold uppercase tracking-wider">Grafik Progress Mingguan</h3>
                        <select class="bg-[#121212] border border-[#2A2A2A] text-[#A1A1AA] text-xs rounded-lg px-3 py-1.5 focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none">
                            <option>Bulan Ini</option><option>Kuartal Ini</option><option>Semua Waktu</option>
                        </select>
                    </div>
                    <div class="h-64 w-full relative"><canvas id="detailWeeklyChart"></canvas></div>
                </div>
            </div>

            <!-- Right / Side Panel (Span 1) -->
            <div class="space-y-6">
                
                <!-- Field Documentation -->
                <div class="bg-[#1A1A1A]/80 backdrop-blur-md rounded-2xl p-6 border border-[#2A2A2A]">
                    <div class="flex justify-between items-center mb-5">
                        <h3 class="text-[#A1A1AA] text-sm font-semibold uppercase tracking-wider">Dokumentasi Lapangan</h3>
                        <button class="text-[#FF7A00] text-xs font-semibold hover:text-[#FFA726] transition-colors">Lihat Semua</button>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        ${['https://images.unsplash.com/photo-1541888086925-0c13d33c5e88?w=300&q=80', 'https://images.unsplash.com/photo-1504307651254-35680f356f58?w=300&q=80', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&q=80', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=300&q=80'].map(img => `<div class="aspect-square rounded-xl bg-[#2A2A2A] border border-[#2A2A2A] overflow-hidden relative group cursor-pointer" onclick="viewPhoto('${img}')"><img src="${img}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" alt="Dokumentasi"><div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-3"><i class="fas fa-expand text-white text-sm drop-shadow-md mb-1"></i></div></div>`).join('')}
                    </div>
                </div>

                <!-- Activity History Log -->
                <div class="bg-[#1A1A1A]/80 backdrop-blur-md rounded-2xl p-6 border border-[#2A2A2A]">
                    <h3 class="text-[#A1A1AA] text-sm font-semibold uppercase tracking-wider mb-6">Log & Catatan Lapangan</h3>
                    <div class="relative border-l-2 border-[#2A2A2A] ml-2 space-y-7 pb-2">
                        ${logHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Init Detail View Chart
    setTimeout(() => {
        const ctx = document.getElementById('detailWeeklyChart');
        if(ctx) {
            if(window.detailChartInst) window.detailChartInst.destroy();
            const labels = Array.from({length: 25}, (_, i) => i === 24 ? 'Mg 25 (Ini)' : 'Mg ' + (i + 1));
            // Menggabungkan data aktual minggu ke grafik (membaca mundur untuk mempertahankan kurva jika minggu tertentu bolong)
            const realisasiData = Array.from({length: 25}, (_, i) => {
                let val = 0;
                for(let j = i + 1; j >= 1; j--) {
                    if(p.weeklyUpdates && p.weeklyUpdates[j]) { val = p.weeklyUpdates[j].total; break; }
                }
                return val;
            });
            const rencanaData = realisasiData.map((val, i) => Math.min(100, val + 5 + Math.floor(i / 2)));
            window.detailChartInst = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: [{ label: 'Realisasi (%)', data: realisasiData, borderColor: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.15)', fill: true, tension: 0.4, pointBackgroundColor: '#FFA726', pointBorderColor: '#FF7A00', borderWidth: 3, pointRadius: 2 }, { label: 'Rencana (%)', data: rencanaData, borderColor: '#64748B', borderDash: [5, 5], backgroundColor: 'transparent', fill: false, tension: 0.4, pointBackgroundColor: '#64748B', pointBorderColor: '#1A1A1A', borderWidth: 2, pointRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: true, labels: { color: '#A1A1AA', usePointStyle: true, boxWidth: 8 } }, tooltip: { backgroundColor: '#1A1A1A', titleColor: '#A1A1AA', bodyColor: '#FFFFFF', borderColor: '#2A2A2A', borderWidth: 1 } }, scales: { y: { grid: { color: '#2A2A2A', drawBorder: false }, ticks: { color: '#A1A1AA' }, max: 100 }, x: { grid: { display: false }, ticks: { color: '#A1A1AA', maxTicksLimit: 12 } } } } });
        }
    }, 100);
};

window.updateSwalTotal = function() {
    const s = parseFloat(document.getElementById('input-sipil').value) || 0;
    const a = parseFloat(document.getElementById('input-ars').value) || 0;
    const m = parseFloat(document.getElementById('input-mep').value) || 0;
    const avg = Number(((s + a + m) / 3).toFixed(2));
    document.getElementById('swal-progress-val').innerText = avg + '%';
};

window.onWeekChange = function(id) {
    const p = mockProjects.find(x => x.id === id);
    if(!p) return;
    const minggu = parseInt(document.getElementById('input-minggu').value);
    const data = p.weeklyUpdates && p.weeklyUpdates[minggu];
    
    const inpSipil = document.getElementById('input-sipil');
    const inpArs = document.getElementById('input-ars');
    const inpMep = document.getElementById('input-mep');
    const noteInp = document.getElementById('swal-input-note');
    const btnSimpan = Swal.getConfirmButton();
    const statusLabel = document.getElementById('status-minggu');
    
    if(data) {
        inpSipil.value = data.sipil;
        inpArs.value = data.ars;
        inpMep.value = data.mep;
        noteInp.value = data.note || '';
        
        inpSipil.disabled = true;
        inpArs.disabled = true;
        inpMep.disabled = true;
        noteInp.disabled = true;
        
        if (btnSimpan) btnSimpan.style.display = 'none';
        if (statusLabel) statusLabel.innerHTML = '<span class="text-[#22C55E] text-xs font-bold"><i class="fas fa-check-circle mr-1"></i>Sudah Diupdate</span>';
    } else {
        let prev = { sipil: 0, ars: 0, mep: 0, note: '' };
        for(let i = minggu - 1; i >= 1; i--) {
            if(p.weeklyUpdates && p.weeklyUpdates[i]) { prev = p.weeklyUpdates[i]; break; }
        }
        
        inpSipil.value = prev.sipil;
        inpArs.value = prev.ars;
        inpMep.value = prev.mep;
        noteInp.value = '';
        
        inpSipil.disabled = false;
        inpArs.disabled = false;
        inpMep.disabled = false;
        noteInp.disabled = false;
        
        if (btnSimpan) btnSimpan.style.display = 'inline-flex';
        if (statusLabel) statusLabel.innerHTML = '<span class="text-[#FF7A00] text-xs font-bold"><i class="fas fa-edit mr-1"></i>Belum Diupdate</span>';
    }
    updateSwalTotal();
};

window.updateProgressSystem = function(id) {
    const p = mockProjects.find(x => x.id === id);
    if(!p) return;
    
    Swal.fire({
        title: 'Update Progress Mingguan',
        width: '500px',
        html: `
            <div class="mt-4 text-left space-y-5">
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <label class="text-sm font-medium text-white">Periode Update</label>
                        <div id="status-minggu"></div>
                    </div>
                    <select id="input-minggu" onchange="onWeekChange(${id})" class="w-full bg-[#121212] border border-[#2A2A2A] text-white rounded-lg p-2.5 outline-none focus:border-[#FF7A00] cursor-pointer">
                        ${Array.from({length: 25}, (_, i) => `<option value="${i+1}">Minggu ke-${i+1}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-white mb-2">Sipil & Struktur (%)</label>
                    <input type="number" id="input-sipil" class="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-2.5 text-white outline-none focus:border-[#FF7A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" min="0" max="100" step="0.01" oninput="updateSwalTotal()" placeholder="Contoh: 75.5">
                </div>
                <div>
                    <label class="block text-sm font-medium text-white mb-2">Arsitektur & Interior (%)</label>
                    <input type="number" id="input-ars" class="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-2.5 text-white outline-none focus:border-[#FFA726] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" min="0" max="100" step="0.01" oninput="updateSwalTotal()" placeholder="Contoh: 40.25">
                </div>
                <div>
                    <label class="block text-sm font-medium text-white mb-2">MEP (Mekanikal Elektrikal) (%)</label>
                    <input type="number" id="input-mep" class="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-2.5 text-white outline-none focus:border-[#F59E0B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" min="0" max="100" step="0.01" oninput="updateSwalTotal()" placeholder="Contoh: 80">
                </div>
                
                <div class="bg-[#121212] p-4 rounded-xl border border-[#2A2A2A] text-center mt-6">
                    <p class="text-xs text-[#A1A1AA] uppercase tracking-wider font-semibold mb-1">Estimasi Progress Keseluruhan</p>
                    <div class="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" id="swal-progress-val">0%</div>
                </div>
                
                <div class="mt-4">
                    <label class="block text-sm font-medium text-[#A1A1AA] mb-2">Catatan Lapangan</label>
                    <textarea id="swal-input-note" class="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl p-3 text-white outline-none focus:border-[#FF7A00] transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed" rows="3" placeholder="Contoh: Pengecoran tahap 2 selesai..."></textarea>
                </div>
            </div>
        `,
        background: '#1A1A1A',
        color: '#FFFFFF',
        showCancelButton: true,
        confirmButtonColor: '#FF7A00',
        cancelButtonColor: '#2A2A2A',
        confirmButtonText: 'Simpan Update',
        cancelButtonText: 'Batal',
        didOpen: () => {
            if(!p.weeklyUpdates) p.weeklyUpdates = {};
            const updatedWeeks = Object.keys(p.weeklyUpdates).map(Number);
            const maxWeek = updatedWeeks.length > 0 ? Math.max(...updatedWeeks) : 0;
            const defaultWeek = maxWeek < 25 ? maxWeek + 1 : 25;
            document.getElementById('input-minggu').value = defaultWeek;
            onWeekChange(id);
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const minggu = parseInt(document.getElementById('input-minggu').value);
            const newSipil = parseFloat(document.getElementById('input-sipil').value) || 0;
            const newArs = parseFloat(document.getElementById('input-ars').value) || 0;
            const newMep = parseFloat(document.getElementById('input-mep').value) || 0;
            const note = document.getElementById('swal-input-note').value;
            const newProgress = Number(((newSipil + newArs + newMep) / 3).toFixed(2));
            
            if(!p.weeklyUpdates) p.weeklyUpdates = {};
            p.weeklyUpdates[minggu] = { sipil: newSipil, ars: newArs, mep: newMep, total: newProgress, note: note };
            
            const updatedWeeks = Object.keys(p.weeklyUpdates).map(Number);
            const maxWeek = Math.max(...updatedWeeks);
            
            // Hanya override keseluruhan jika minggu yg di-update adalah minggu paling akhir/tertinggi
            if (minggu === maxWeek) {
                p.divSipil = newSipil;
                p.divArs = newArs;
                p.divMep = newMep;
                p.progress = newProgress;
                
                if (newProgress === 100) p.status = 'Selesai';
                else if (newProgress > 0) p.status = 'Berjalan';
                else p.status = 'Perencanaan';
            }
            
            // Re-render UI dashboard & detail agar langsung berubah
            renderProjectCards();
            viewDetail(id);
            
            Swal.fire({ icon: 'success', title: 'Update Berhasil', text: 'Progress proyek (Minggu ke-' + minggu + ') telah diubah menjadi ' + newProgress + '%', confirmButtonColor: '#FF7A00', background: '#1A1A1A', color: '#FFFFFF' });
        }
    });
};

window.closeProjectDetail = function() {
    document.getElementById('view-project-detail').classList.add('hidden');
    const viewGrid = document.getElementById('view-overview');
    if(viewGrid) {
        viewGrid.classList.remove('hidden');
        viewGrid.style.opacity = 0;
        setTimeout(() => viewGrid.style.opacity = 1, 50);
        if(map) setTimeout(() => map.invalidateSize(), 100);
    } else {
        document.querySelector('.view-section').classList.remove('hidden');
    }
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
    // Force Enterprise Dark Mode config for charts
    const gridColor = '#2A2A2A';
    const textColor = '#A1A1AA';

    // Destroy existing instances if changing themes
    chartsInstance.forEach(c => c.destroy());
    chartsInstance = [];

    const lineCtx = document.getElementById('lineChart');
    if(lineCtx) {
        chartsInstance.push(new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                datasets: [{ label: 'Progress Keseluruhan (%)', data: [15, 30, 45, 55, 65, 68], borderColor: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.15)', fill: true, tension: 0.4, pointBackgroundColor: '#FFA726', pointBorderColor: '#FF7A00', borderWidth: 3 }]
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
            data: { labels: ['Berjalan', 'Selesai', 'Tertunda'], datasets: [{ data: [12, 24, 1], backgroundColor: ['#FF7A00', '#22C55E', '#EF4444'], borderWidth: 0, hoverOffset: 6 }] }, 
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
    Swal.fire({ icon: 'success', title: 'Berhasil Deployed', text: 'Sistem proyek baru berhasil dibuat.', confirmButtonColor: '#FF7A00', background: '#1A1A1A', color: '#FFFFFF' });
};

window.generateReport = function() {
    Swal.fire({ title: 'Kompilasi Data...', text: 'Menyiapkan dokumen laporan analitik anda', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#1A1A1A', color: '#FFFFFF' });
    setTimeout(() => {
        Swal.fire({ icon: 'success', title: 'Export Berhasil', text: 'Laporan telah diunduh ke perangkat Anda.', confirmButtonColor: '#FF7A00', background: '#1A1A1A', color: '#FFFFFF' });
    }, 2000);
};

window.viewPhoto = function(url) {
    Swal.fire({ imageUrl: url, imageWidth: '100%', imageAlt: 'Dokumentasi', showConfirmButton: false, background: 'transparent', backdrop: 'rgba(0,0,0,0.85)' });
};