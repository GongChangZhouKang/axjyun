const vueWindow = window as typeof window & {
    __VUE_OPTIONS_API__?: boolean;
    __VUE_PROD_DEVTOOLS__?: boolean;
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__?: boolean;
};

vueWindow.__VUE_OPTIONS_API__ = true;
vueWindow.__VUE_PROD_DEVTOOLS__ = false;
vueWindow.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

export {};
