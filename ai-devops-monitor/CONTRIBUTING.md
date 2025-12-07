# Contributing to AI DevOps Monitor

Thank you for your interest in contributing to AI DevOps Monitor! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/ai-devops-monitor.git
   cd ai-devops-monitor
   ```
3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Local Development

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services**
   ```bash
   docker-compose up -d opensearch ollama
   ```

4. **Run backend**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Run dashboard**
   ```bash
   cd dashboard
   streamlit run app.py
   ```

## Code Style

- Follow PEP 8 for Python code
- Use type hints where appropriate
- Keep functions focused and well-documented
- Write descriptive commit messages

### Code Formatting

We recommend using:
- `black` for code formatting
- `isort` for import sorting
- `flake8` for linting

```bash
pip install black isort flake8
black .
isort .
flake8 .
```

## Testing

Before submitting a PR, ensure:
1. All existing tests pass
2. New features include tests
3. Code coverage is maintained

```bash
pytest
```

## Pull Request Process

1. **Update documentation** - Update README.md if needed
2. **Add tests** - Include tests for new features
3. **Follow code style** - Ensure code follows project conventions
4. **Describe changes** - Write a clear PR description
5. **Link issues** - Reference related issues

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] All tests passing
- [ ] No merge conflicts
- [ ] Commit messages are descriptive

## Feature Requests

Have an idea? We'd love to hear it!

1. Check if the feature already exists in issues
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Discuss implementation approach

## Bug Reports

Found a bug? Help us fix it!

1. Check if the bug is already reported
2. Create a new issue with the `bug` label
3. Include:
   - Description of the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - System information (OS, Python version, etc.)
   - Logs or error messages

## Areas for Contribution

We especially welcome contributions in:

### Core Features
- Improved anomaly detection algorithms
- Additional ML models for prediction
- Enhanced LLM prompts for better RCA
- Real-time streaming support

### Integrations
- Additional notification channels (PagerDuty, Teams, etc.)
- Log source integrations (Kafka, Fluentd, etc.)
- Metrics collectors (Prometheus, Datadog, etc.)
- CI/CD pipeline integrations

### UI/UX
- Dashboard improvements
- Mobile-responsive design
- Data visualization enhancements
- User preferences and customization

### Documentation
- Tutorial videos
- Use case examples
- Deployment guides
- API documentation

### DevOps
- Kubernetes deployment manifests
- Terraform modules
- Monitoring and observability
- Performance optimization

## Architecture Guidelines

### Backend (FastAPI)
- Keep routes thin, move logic to services
- Use dependency injection
- Handle exceptions gracefully
- Return consistent response formats

### Services
- Single responsibility principle
- Use type hints
- Include docstrings
- Handle errors at service level

### ML Models
- Document model training process
- Include model versioning
- Provide evaluation metrics
- Support model retraining

### Dashboard
- Keep components modular
- Optimize for performance
- Handle loading states
- Provide error feedback

## Community

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs and request features via Issues
- **Pull Requests**: Submit code contributions via PRs

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Questions?

Feel free to:
- Open a discussion on GitHub
- Comment on relevant issues
- Reach out to maintainers

Thank you for contributing to AI DevOps Monitor! 🎉
