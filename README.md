
# Obfirmo

Obfirmo is a deterministic password manager that generates passwords based on a master key and site/account name. It ensures secure and unique passwords for different sites without storing any sensitive data.

## Features

- **Free and Easy to Use**: Simple interface to generate secure passwords.
- **Offline Functionality**: No data collection, works entirely offline.
- **Security Breach Checker**: Uses the Have I Been Pwned API to check if the generated password has been compromised.
- **Customizable Passwords**: Adjust password length and include/exclude specific character types.
- **Browser Compatibility**: Works best on modern browsers.

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/CRYPTXMNESIA/obfirmo.git
    cd obfirmo
    ```

2. Install dependencies:

    ```sh
    npm install
    # or
    yarn install
    ```

### Running the Development Server

Start the Vite development server:

```sh
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

To create a production build of the app:

```sh
npm run build
# or
yarn build
```

The production-ready files will be generated in the `dist` directory.

### Running the Production Build Locally

To preview the production build locally:

```sh
npm run serve
# or
yarn serve
```

## Usage

1. Enter your Obfirmo ID (username).
2. Enter your Master Key.
3. Enter the site or account name.
4. Specify the desired length of the password.
5. Click the key button to generate your password.

## Pros and Cons

### Pros

- **Free**
- **Easy to use**
- **Fully offline**
- **No data collection**
- **Highly secure passwords**
- **Installable as a PWA**
- **Built-in security breach checker**

### Cons

- **Irrecoverable Master Key**: If you forget the master key, you can't recover it.
- **Potential Compromise**: If your master key is leaked, all your passwords can be compromised.

## About

Obfirmo is made with ❤ by [ZODSEC](https://discord.gg/y8y95AXT7r).

### Contributing

Feel free to open issues or submit pull requests on the [GitHub repository](https://github.com/CRYPTXMNESIA/obfirmo).

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

![GitHub](https://img.shields.io/github/license/CRYPTXMNESIA/obfirmo)
