const API_BASE_URL = "http://localhost:8080/api";

async function request(url, options = {}) {
    const config = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    };

    if (config.body && typeof config.body !== "string") {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API request error:", error);
        throw error;
    }
}

const SpeaklyAPI = {
    getLessonBySlug(slug) {
        return request(`/lessons/slug/${encodeURIComponent(slug)}`);
    },

    // getLessons(params = {}) {
    //     const query = new URLSearchParams(params).toString();
    //     return request(`/lessons${query ? `?${query}` : ""}`);
    // },
    //
    // getCategories() {
    //     return request("/categories");
    // },
    //
    // getHomePage() {
    //     return request("/home");
    // }

    getCategoryDetail(category) {
        return request(`/categories/code/${encodeURIComponent(category)}/detail`);
    }

};