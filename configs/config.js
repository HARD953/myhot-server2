  export const config = {
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    endpointId: process.env.ENDPOINT_ID,
    dialect: "postgres",
    url: process.env.URL,
    jwt: {
      secret: process.env.JWT_SECRET,
    },
  };