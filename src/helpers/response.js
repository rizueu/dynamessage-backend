module.exports = (
  res,
  status,
  success,
  message,
  results,
  ...optionalProperty
) => {
  const [prevPageLink, nextPageLink, currentPage] = optionalProperty;
  if (results && Array.isArray(results)) {
    return res.status(status).json({
      success,
      message,
      results,
      pageInfo: {
        length: results.length,
        currentPage: currentPage,
        previousPageLink: optionalProperty ? prevPageLink : null,
        nextPageLink: optionalProperty ? nextPageLink : null,
      },
    });
  } else if (results && !Array.isArray(results)) {
    return res.status(status).json({
      success,
      message,
      results,
    });
  } else {
    return res.status(status).json({
      success,
      message,
    });
  }
};
