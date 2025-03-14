# Prisma Turso Migration Utility

A simple utility that makes it easier to apply Prisma migrations to Turso Sqlite databases. This tool eliminates the need to manually copy migration file names when using the Turso CLI.

I made this pretty quick for myself, and thought it'd be nice to polish it a bit and publish. Any help or ideas would be great!

## 🌟 Features

- Automatically finds the latest Prisma migration
- Provides options to copy the migration path or execute it directly with Turso
- Configurable via command-line arguments or configuration files
- Easy integration with Next.js projects and CI/CD pipelines

## 📦 Installation

Install it locally in your project:

```bash
# Clone the repository
git clone https://github.com/nstranquist/prisma-turso-migration-util.git bin/migration-util

# Install dependencies
cd bin/migration-util
pnpm install
```

## 🚀 Usage

### Basic Usage

```bash
# Find the latest migration and provide options
npx copy-migration my-database-name

# Automatically apply the latest migration
npx copy-migration my-database-name --auto
```

### Command Line Options

- `<database-name>`: The name of your Turso database
- `--auto` or `-a`: Automatically apply the migration without confirmation
- `--migrations-dir=<path>`: Specify a custom path to your migrations directory

### Integration with Next.js

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "generate": "prisma generate",
    "migrate": "cd bin/migration-util && pnpm run build && node dist/index.js my-database-name $PNPM_SCRIPT_ARGS",
    "migration:dev": "cd bin/migration-util && pnpm run dev -- $PNPM_SCRIPT_ARGS"
  }
}
```

Then run:

```bash
# Apply the latest migration
npm run migrate

# Apply with auto-confirmation
npm run migrate -- --auto
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd bin/migration-util && pnpm install && pnpm run build
      - run: cd bin/migration-util && node dist/index.js my-database-name --auto
```

## ⚙️ Configuration

You can configure the utility using:

1. Command-line arguments (highest priority)
2. Environment variables in a `.env` file
3. A `default-config.json` file

Example `.env` file:

```
DATABASE_URL=your-database-url
API_KEY=your-api-key
PORT=3000
```

## 🧩 How It Works

1. The utility scans your Prisma migrations directory
2. It identifies the latest migration based on the timestamp in the folder name
3. It provides options to:
   - Copy the migration path for manual execution
   - Automatically execute the migration using the Turso CLI
   - Skip the migration

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/nstranquist/prisma-turso-migration-util.git
cd prisma-turso-migration-util

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build the project
pnpm build

# Run tests
pnpm test
```

## 📄 License

MIT

---

Made with ❤️ by [nstranquist](https://github.com/nstranquist)
