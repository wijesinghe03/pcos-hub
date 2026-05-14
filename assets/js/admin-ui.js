/**
 * admin-ui.js
 * Common UI logic for all admin dashboard pages.
 * This script should be loaded AFTER utils.js to correctly override common functions.
 */

(function() {
    function adminInitSidebarProfile() {
        const userStr = localStorage.getItem('pcos_user');
        if (!userStr) return;
        
        try {
            const user = JSON.parse(userStr);
            const sidebarName = document.getElementById('sidebarName');
            const sidebarAvatar = document.getElementById('sidebarAvatar');
            const sidebarRole = document.getElementById('sidebarRole');

            if (sidebarName) sidebarName.textContent = user.full_name || user.name || 'Admin User';
            
            if (sidebarRole) {
                const role = user.role || 'admin';
                sidebarRole.textContent = role === 'superadmin' ? 'Super Administrator' : 'System Administrator';
            }
            
            if (sidebarAvatar) {
                if (user.avatar) {
                    // For admin pages (located in /admin/), the uploads folder is at ../uploads/
                    sidebarAvatar.innerHTML = `<img src="../${user.avatar}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%">`;
                    sidebarAvatar.style.background = 'none';
                } else {
                    const name = user.full_name || user.name || 'A';
                    sidebarAvatar.textContent = name.charAt(0).toUpperCase();
                    sidebarAvatar.style.background = ''; // Reset to default CSS background
                }
            }
        } catch (e) {
            console.error('Error initializing sidebar profile:', e);
        }
    }

    // Override the global initSidebarProfile function defined in utils.js
    // This is necessary because utils.js uses relative paths that don't work for admin subfolder
    window.initSidebarProfile = adminInitSidebarProfile;

    // Run immediately if DOM is ready, or wait for DOMContentLoaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        adminInitSidebarProfile();
    } else {
        document.addEventListener('DOMContentLoaded', adminInitSidebarProfile);
    }
})();
