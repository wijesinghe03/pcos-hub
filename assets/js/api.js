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
    async call(script, data = null, method = null) {
        let url = this.getPHPPath(script);
        const resolvedMethod = method || (data ? 'POST' : 'GET');
        
        const options = {
            method: resolvedMethod,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (resolvedMethod === 'GET' && data) {
            const params = new URLSearchParams();
            for (const key in data) {
                if (data[key] !== null && data[key] !== undefined) {
                    params.append(key, data[key]);
                }
            }
            const queryString = params.toString();
            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString;
            }
        } else if (data && resolvedMethod !== 'GET') {
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
