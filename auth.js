document.addEventListener('DOMContentLoaded', () => {
    AOS.init();

    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Show/Hide Password
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye text-gray-400 hover:text-white transition-colors"></i>' : '<i class="fas fa-eye-slash text-gray-400 hover:text-white transition-colors"></i>';
        });
    }

    // Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.toLowerCase();
            const password = document.getElementById('password').value;

            // Tampilkan animasi loading modern
            Swal.fire({
                title: 'Authenticating...',
                text: 'Memverifikasi kredensial Anda',
                allowOutsideClick: false,
                background: '#1a1a1a',
                color: '#fff',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Simulasi proses verifikasi ke server (1.5 detik)
            setTimeout(() => {
                let role = 'Viewer';
                if (username.includes('admin')) role = 'Super Admin';
                else if (username.includes('manager')) role = 'Project Manager';

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', role);
                localStorage.setItem('userName', username.split('@')[0].toUpperCase());

                Swal.fire({
                    icon: 'success',
                    title: 'Akses Diberikan!',
                    text: `Selamat datang, Anda login sebagai ${role}`,
                    background: '#1a1a1a',
                    color: '#fff',
                    confirmButtonColor: '#f97316',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => window.location.href = 'dashboard.html');
            }, 1500);
        });
    }
});