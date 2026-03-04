/**
 * PCOS CARE HUB — API Handler (api.js)
 * This utility helps the frontend communicate with the PHP backend.
 */

const API = {
    /**
     * Base path for PHP scripts
     * Since the JS is in /assets/js and PHP is in /src/php
     * We calculate the relative path from the current page.
     */
    getPHPPath(scriptName) {
        // Find the root path (pcos-hub)
        const path = window.location.pathname;
        const root = path.substring(0, path.indexOf('/pcos-hub/') + 10);
        return root + 'src/php/' + scriptName;
    },

    /**
     * Generic fetch wrapper
     */
    async call(script, data = null) {
        const url = this.getPHPPath(script);
        const options = {
            method: data ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Call Error:', error);
            return { status: 'error', message: error.message };
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
