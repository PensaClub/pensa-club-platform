const requester = async (method, url, data) => {
  const options = {};

  if (method !== "GET") {
    options.method = method;

    if (data) {
      options.headers = {
        "content-type": "application/json",
      };

      options.body = JSON.stringify(data);
    }
  }

  const serializedAuth = localStorage.getItem("auth");
  if (serializedAuth) {
    const auth = JSON.parse(serializedAuth);

    if (auth.token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${auth.token}`,
      };
    }

  }

  const response = await fetch(url, options);

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
};

export const requestFactory = () => {
  return {
    get: requester.bind(null, "GET"),
    post: requester.bind(null, "POST"),
    put: requester.bind(null, "PUT"),
    patch: requester.bind(null, "PATCH"),
    del: requester.bind(null, "DELETE"),
  };
};
