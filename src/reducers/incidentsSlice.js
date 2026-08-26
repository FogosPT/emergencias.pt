const initialState = {
    data: [],
    loading: false,
    error: null,
};

function sortBy(list, field, order) {
    const sign = order === -1 ? -1 : 1;
    return [...list].sort((a, b) => {
        const av = a?.[field];
        const bv = b?.[field];
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return av < bv ? -1 * sign : 1 * sign;
    });
}

export function createIncidentsReducer({ pending, fulfilled, rejected, sort }) {
    return function reducer(state = initialState, action) {
        switch (action.type) {
            case pending:
                return { ...state, loading: true, error: null };
            case fulfilled:
                return {
                    ...state,
                    loading: false,
                    error: null,
                    data: Array.isArray(action.payload) ? action.payload : [],
                };
            case rejected:
                return { ...state, loading: false, error: action.payload };
            case sort:
                return { ...state, data: sortBy(state.data, action.field, action.order) };
            default:
                return state;
        }
    };
}
