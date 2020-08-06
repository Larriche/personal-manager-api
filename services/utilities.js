const queryString = require('query-string');
const path = require('path');

const Utilities = {
    /**
     * Get params to be used for resource listing pagination
     *
     * @param {Object} requestData Data from a get request
     * @return {Object} queryParams Constructed query params
     */
    getPaginationParams(requestData) {
        let pagination = {
            offset: 0,
            limit: 0
        };

        if (requestData.hasOwnProperty('per_page')) {
            let perPage = Number(requestData.per_page);
            let page = requestData.hasOwnProperty('page') ? Number(requestData.page) : 1;

            pagination.limit = perPage;

            if (requestData.hasOwnProperty('page')) {
                pagination.offset = (page - 1) * perPage;
            }
        }

        return pagination;
    },

    /**
     * Fix pagination details onto a listing that is paginated
     *
     * @param {Object} request The HTTP request
     * @param {Object} responseData Data about to be sent as a response
     * @param {Integer} total Total number of resources
     */
    setPaginationFields(request, responseData, total) {
        if (!request.query.hasOwnProperty('per_page')) {
            return responseData;
        }

        let params = request.query;
        let currPage = params.hasOwnProperty('page') ? Number(params.page) : 1;
        let perPage = Number(params.per_page);

        let nextPageParams = Object.assign({}, params, {
            page: currPage + 1
        });

        let prevPageParams = Object.assign({}, params, {
            page: currPage - 1
        });

        let lastPageParams = Object.assign({}, params, {
            page: total / perPage
        });

        let fullUrl = request.protocol + '://' + request.get('Host') + request.originalUrl.split("?").shift() + "?";
        let lastPageUrl = fullUrl + queryString.stringify(lastPageParams);
        let nextPageUrl = fullUrl + queryString.stringify(nextPageParams);
        let prevPageUrl = fullUrl + queryString.stringify(prevPageParams);

        responseData.pagination_details = {
            per_page: perPage,
            curr_page: currPage,
            total: total
        };

        if (currPage > 1) {
            responseData.pagination_details.prev_page_url = prevPageUrl;
        } else {
            responseData.pagination_details.prev_page_url = null
        }

        if (total - (currPage * perPage) > 0) {
            responseData.pagination_details.next_page_url = nextPageUrl;
        } else {
            responseData.pagination_details.next_page_url = null;
        }

        responseData.pagination_details.last_page_url = lastPageUrl;

        return responseData;
    }
};

module.exports = Utilities;