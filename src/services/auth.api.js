import API from "./api";
import {
  AUTH,
  CATEGORIES,
  CUSTOMERS,
  DASHBOARD,
  ITEMS,
  PROVIDERS,
  SERVICEBOOK,
  SERVICECATEGORIES,
  SERVICESUBCATEGORIES,
  SUBCATEGORIES,
  SUBCRIPTION,
} from "./endpoints";

export const loginApi = (payload) => {
  return API.post(AUTH.LOGIN, payload);
};

export const logoutApi = () => {
  return API.post(AUTH.LOGOUT);
};

export const getDashBoardCount = () => {
  return API.get(DASHBOARD.COUNT);
};

export const getAllCustomers = () => {
  return API.get(CUSTOMERS.LIST);
};

export const updateCustomerAds = (id, adsCount) => {
  return API.put(
    `${CUSTOMERS.UPDATE}?id=${id}`,
    { is_ads: adsCount },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const getAllProviders = () => {
  return API.get(PROVIDERS.LIST);
};

export const providerStatusUpdate = (id, status) => {
  return API.put(
    `${PROVIDERS.UPDATE}?id=${id}`,
    { status },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const getAllSubcription = () => {
  return API.get(SUBCRIPTION.LIST);
};

export const createCategory = (formData) => {
  return API.post(CATEGORIES.ADD, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllCategories = () => {
  return API.get(CATEGORIES.LIST);
};

export const editCategory = (id, formData) => {
  return API.put(`${CATEGORIES.UPDATE}?id=${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteCategory = (id) => {
  return API.delete(`${CATEGORIES.DELETE}?id=${id}`);
};

export const createSubcategory = (formData) => {
  return API.post(SUBCATEGORIES.ADD, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllSubCategories = () => {
  return API.get(SUBCATEGORIES.LIST);
};

export const editSubcategory = (id, formData) => {
  return API.put(`${SUBCATEGORIES.UPDATE}?id=${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteSubcategory = (id) => {
  return API.delete(`${SUBCATEGORIES.DELETE}?id=${id}`);
};

export const createItem = (formData) => {
  return API.post(ITEMS.ADD, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllItems = () => {
  return API.get(ITEMS.LIST);
};

export const createServiceCategory = (formData) => {
  return API.post(SERVICECATEGORIES.ADD, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllServiceCategories = () => {
  return API.get(SERVICECATEGORIES.LIST);
};

export const editServiceCategory = (id, formData) => {
  return API.put(`${SERVICECATEGORIES.UPDATE}?id=${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteServiceCategory = (id) => {
  return API.delete(`${SERVICECATEGORIES.DELETE}?id=${id}`);
};

export const createServiceSubcategory = (payload) => {
  return API.post(SERVICESUBCATEGORIES.ADD, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getAllServeSubCategories = () => {
  return API.get(SERVICESUBCATEGORIES.LIST);
};

export const editServiceSubCategory = (id, payload) => {
  return API.put(`${SERVICESUBCATEGORIES.UPDATE}?id=${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteServiceSubCategory = (id) => {
  return API.delete(`${SERVICESUBCATEGORIES.DELETE}?id=${id}`);
};

export const getAllBookings = () => {
  return API.get(SERVICEBOOK.LIST);
};

export const getBookingProviderName = (service_cat_id, service_subcat_id) => {
  return API.get(SERVICEBOOK.PROVIDERNAME, {
    params: {
      service_cat_id,
      service_subcat_id,
    },
  });
};

export const serviceProviderAssign = (payload) => {
  return API.put(SERVICEBOOK.PROVIDERASSIGN, payload)
}










