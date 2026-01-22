# Contributing to c32check

Thank you for your interest in contributing to c32check! This library provides Crockford base-32 encoding with checksums for the Stacks blockchain.

## How to Contribute

### Reporting Issues

- Check existing issues before creating a new one
- Provide a clear description of the problem
- Include steps to reproduce the issue
- Specify the version of c32check you're using

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following the coding style of the project
4. **Write tests** for any new functionality
5. **Run the test suite**: `npm test`
6. **Ensure linting passes**: `npm run lint`
7. **Commit your changes** with clear, descriptive commit messages
8. **Push to your fork** and submit a pull request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/c32check.git
cd c32check

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Code Style

- Follow the existing TypeScript coding patterns in the project
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Keep functions focused and single-purpose

### Testing

- Write unit tests for new features
- Ensure all existing tests pass before submitting
- Test edge cases, especially for encoding/decoding functions
- Run `npm run test:big-data` for extensive test coverage

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Reference any related issues in the PR description
- Update documentation if your changes affect the public API
- Be responsive to feedback and code review comments

## Questions?

If you have questions about contributing, feel free to open an issue for discussion.

## License

By contributing to c32check, you agree that your contributions will be licensed under the MIT License.
