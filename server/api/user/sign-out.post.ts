export default defineEventHandler(async (event) => {
  try {
    deleteCookie(event, "authorization");
    return 200;
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
