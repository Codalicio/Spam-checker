const requiredEnvVars = [
  "DATABASE_URL", // Database connection string
  "JWT_SECRET", // Secret key for JWT
  "PORT", // Port number for server
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    // If any variables are missing, print error and exit
    console.error("Missing required environment variables : ");

    missing.forEach((varName) => {
      console.error(`- ${varName}`);
    });

    console.error(`\nPlease check your .env file!`);
    process.exit(1);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    console.error(`JWT_SECRET must be at least 32 characters long!`);
    console.error(`Generate a strong secret with : `);
    console.error(
      `node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'`
    );
    process.exit(1);
  }

  console.log("Environment variables validated");
};

module.exports = { validateEnv };
