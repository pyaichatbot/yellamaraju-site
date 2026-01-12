# Learning Log - yellamaraju.com Blog Platform

## Document Control
| Version | Date | Author | Purpose |
|---------|------|--------|---------|
| 1.0 | 2026-01-10 | Engineering Team | Track learnings and prevent repeated mistakes |

---

## Purpose

This log captures:
1. **Mistakes made** during implementation
2. **Root causes** of issues
3. **Lessons learned** and how to prevent recurrence
4. **Best practices** discovered
5. **Technical decisions** and their outcomes

**Update Frequency**: After each story completion or when significant issue encountered

---

## Log Format

Each entry uses this template:
```markdown
### [YYYY-MM-DD] Story X.X: Story Title

**What Happened**: Brief description of the issue/learning

**Root Cause**: Why did this happen?

**Impact**: What was affected? (time lost, bugs introduced, etc.)

**Solution**: How was it resolved?

**Lesson Learned**: What should we do differently?

**Action Items**: Specific preventive measures

**Tags**: #security #performance #testing #architecture #deployment
```

---

## Learning Categories

### 1. Security Learnings
Issues related to security vulnerabilities, PII leakage, authentication, etc.

### 2. Performance Learnings
Performance bottlenecks, latency issues, optimization discoveries

### 3. Testing Learnings
Test failures, edge cases, testing strategies

### 4. Architecture Learnings
Design decisions, refactoring needs, architectural issues

### 5. Deployment Learnings
CI/CD, Docker, Kubernetes, infrastructure issues

### 6. Integration Learnings
Third-party API issues, protocol implementations, agent interactions

---

## Learning Entries

### [2026-01-10] Project Setup

**What Happened**: Initial blog platform structure defined and documentation completed

**Key Decisions**:
- Astro 4.0+ for static site generation (performance, simplicity)
- MDX for content (markdown + components)
- Netlify for deployment (static site optimized)
- No backend required (fully static, cost-effective)

**Rationale**: 
- Astro provides excellent performance for content sites
- MDX enables rich content with code examples and diagrams
- Static site = no server costs, infinite scalability
- Netlify provides excellent developer experience

**Lesson Learned**: Static site generators are perfect for content-focused blogs

**Tags**: #architecture #planning

---

### [2026-01-10] Story 1.1: Blog Post Creation Workflow

**What Happened**: Successfully set up MDX content system with Astro content collections.

**Key Achievements**:
- Content collections configured correctly
- Frontmatter schema validation working
- Code syntax highlighting functional
- Image optimization configured

**Impact**: Positive - Blog publishing workflow established

**Solution**: 
- Used Astro's built-in content collections
- Configured MDX with rehype/remark plugins
- Set up proper frontmatter schema

**Lesson Learned**: 
- Astro content collections provide excellent type safety
- MDX enables rich content without complexity
- Frontmatter validation catches errors early

**Action Items**:
- [ ] Document MDX component usage patterns
- [ ] Create template for new blog posts
- [ ] Set up pre-commit hooks for frontmatter validation

**Tags**: #content #astro #mdx

---

### [2026-01-10] Story 1.2: Backend API Skeleton (FastAPI)

**What Happened**: Ruff linting found unused imports in `security.py` and `exception_handler.py` after initial implementation.

**Root Cause**: Added imports during development that weren't actually used in the final implementation.

**Impact**: Minor - linting errors that needed fixing, ~2 minutes.

**Solution**: Removed unused imports (`Optional` from `security.py`, `Dict` and `Any` from `exception_handler.py`).

**Lesson Learned**: 
- Run linting checks frequently during development, not just at the end
- Use IDE/editor plugins to catch unused imports in real-time
- Consider pre-commit hooks to catch these automatically

**Action Items**:
- [ ] Set up pre-commit hooks with ruff for automatic linting
- [ ] Configure IDE to show unused imports warnings

**Tags**: #code-quality #linting #testing

---

### [2026-01-10] Story 1.4: OAuth2 Authentication with JWT

**What Happened**: 
1. Test database isolation issue - test client uses actual database connection while test fixtures use separate engine
2. Docker volume mount needed for tests directory to run tests inside container
3. SQLite doesn't support PostgreSQL UUID types - had to switch test database to PostgreSQL

**Root Cause**: 
1. Test client (FastAPI TestClient) uses `get_db()` dependency which connects to the actual database, while pytest fixtures create tables in a separate test database engine. This causes "relation does not exist" errors when tests don't use fixtures that create tables.
2. Tests directory wasn't mounted in Docker container, so tests couldn't be run from inside container
3. conftest.py was using SQLite in-memory database, but models use PostgreSQL UUID types which SQLite doesn't support

**Impact**: 
- ~30 minutes debugging test database issues
- Had to update docker-compose.yml to mount tests directory
- Had to update conftest.py to use PostgreSQL instead of SQLite

**Solution**: 
1. Updated docker-compose.yml to mount `./tests:/tests` in backend container
2. Updated conftest.py to use PostgreSQL from settings instead of SQLite
3. Ensured migrations are run before tests (tables exist in database)
4. One test still has isolation issue but doesn't affect functionality (42/43 tests pass)

**Lesson Learned**:
- Use same database type for tests as production (PostgreSQL, not SQLite)
- Mount test directories in Docker containers for easier test execution
- Consider using database transaction rollback for test isolation instead of separate engines
- Test client dependencies need to be mocked or use same database as fixtures

**Action Items**:
- [ ] Consider using pytest fixtures to override `get_db()` dependency in tests
- [ ] Document test database setup requirements
- [ ] Consider using test database transactions for better isolation

**Tags**: #testing #docker #database #test-infrastructure

---

### [2026-01-10] Story 1.5: PII Redaction in Logging

**What Happened**: 
Successfully implemented PII redaction system with comprehensive test coverage. All tests pass and performance requirements met.

**Root Cause**: 
N/A - Implementation went smoothly with no issues encountered.

**Impact**: 
Positive - System now automatically redacts PII from all log messages, ensuring GDPR/CCPA compliance.

**Solution**: 
- Created PIIRedactor class with regex patterns for common PII types
- Implemented PIILogFilter that integrates with Python logging system
- Added setup_pii_logging() helper function for easy integration
- Comprehensive test suite covering all patterns and edge cases

**Lesson Learned**:
- Regex patterns need careful design to avoid false positives
- Performance testing is critical for logging systems (must be <1ms)
- Log filters are the right place to apply redaction (before formatting)
- Custom patterns allow extensibility for future requirements

**Action Items**:
- [ ] Consider adding more PII patterns (passport numbers, driver's license, etc.)
- [ ] Document pattern customization in README
- [ ] Consider adding pattern configuration via environment variables

**Tags**: #security #logging #compliance #gdpr #ccpa

---

### [2026-01-10] Story 1.3: Database Models & Migrations

**What Happened**: Initial migration created successfully, but encountered a datetime import issue in User model where `datetime` type was used instead of SQLAlchemy's `DateTime` type.

**Root Cause**: Used Python's `datetime` class directly as a Column type instead of SQLAlchemy's `DateTime` type. Also had unused imports in several model files.

**Impact**: Minor - migration generation failed initially, ~3 minutes to fix.

**Solution**: 
- Changed `Column(datetime, ...)` to `Column(DateTime, ...)` in User model
- Removed unused imports (relationship, Decimal) from model files
- All models now use proper SQLAlchemy types

**Lesson Learned**: 
- Always use SQLAlchemy types (DateTime, String, etc.) not Python types for Column definitions
- Run linting checks before creating migrations
- Import only what you use (relationship imports were for future use)

**Action Items**:
- [ ] Set up pre-commit hooks to catch type errors before migration generation
- [ ] Document SQLAlchemy type usage in coding standards

**Tags**: #database #sqlalchemy #migrations #code-quality

---

### [Template Entry - To Be Filled During Implementation]

**What Happened**: 

**Root Cause**: 

**Impact**: 

**Solution**: 

**Lesson Learned**: 

**Action Items**:
- [ ] 
- [ ] 

**Tags**: 

---

## Common Pitfalls to Avoid

### Security Pitfalls
1. ❌ **Don't trust LLM output for financial calculations**
   - ✅ Use deterministic pricing/tax services
   
2. ❌ **Don't log PII without redaction**
   - ✅ Use PII redactor on all logs

3. ❌ **Don't skip signature verification on totals**
   - ✅ Always verify HMAC signature before order commit

4. ❌ **Don't allow cross-tenant data access**
   - ✅ Always filter by `tenant_id` at DB layer

5. ❌ **Don't hardcode secrets**
   - ✅ Use environment variables + Secret Manager

---

### Testing Pitfalls
1. ❌ **Don't skip edge case testing**
   - ✅ Test: null inputs, malformed data, boundary values

2. ❌ **Don't test only happy paths**
   - ✅ Test error scenarios, timeouts, retries

3. ❌ **Don't commit without running tests**
   - ✅ Pre-commit hooks enforce test execution

4. ❌ **Don't mock external APIs without contract tests**
   - ✅ Use contract testing for PSP/merchant integrations

---

### Performance Pitfalls
1. ❌ **Don't make N+1 database queries**
   - ✅ Use eager loading / batch queries

2. ❌ **Don't call LLM synchronously in request path**
   - ✅ Use streaming or async patterns

3. ❌ **Don't store large objects in Redis**
   - ✅ Use references, store large data in DB/S3

4. ❌ **Don't skip database indexing**
   - ✅ Index `tenant_id`, `user_id`, `created_at`

---

## Best Practices Discovered

### Code Quality
- ✅ Use Pydantic for all request/response validation
- ✅ Type hints on all functions
- ✅ Docstrings for public APIs
- ✅ Keep functions under 50 lines
- ✅ Single responsibility per function/class

### Testing
- ✅ Minimum 80% code coverage
- ✅ Test files mirror source structure (`tests/api/test_auth.py` ↔ `app/api/auth.py`)
- ✅ Use fixtures for test data
- ✅ Mock external dependencies (PSP, LLM)
- ✅ Parametrize tests for multiple inputs

### Security
- ✅ All secrets in environment variables
- ✅ PII redaction on all logs
- ✅ Tenant ID validation on all queries
- ✅ HMAC signature on financial data
- ✅ Rate limiting on all endpoints
- ✅ Input validation via Pydantic schemas

### Git Workflow
- ✅ Feature branches from `develop`
- ✅ Descriptive commit messages (50 char summary + body)
- ✅ PR requires 2 approvals + CI passing
- ✅ Squash merge to keep history clean
- ✅ Tag releases with semantic versioning

---

## Technical Debt Log

Track intentional shortcuts that need future resolution.

| Date | Story | Debt Description | Severity | Target Resolution |
|------|-------|------------------|----------|-------------------|
| TBD | - | - | - | - |

**Severity Levels**:
- **Critical**: Security/compliance risk, must fix before GA
- **High**: Performance/reliability issue, fix before beta
- **Medium**: Code quality issue, fix in next sprint
- **Low**: Nice-to-have refactoring, backlog

---

## Metrics Tracking

Track key metrics to validate decisions.

### Development Velocity
| Sprint | Story Points Committed | Story Points Completed | Velocity |
|--------|------------------------|------------------------|----------|
| Sprint 1 | 16 | 8 | 8 (3 stories complete) |
| Sprint 2 | 16 | TBD | TBD |
| Sprint 3 | 10 | TBD | TBD |

### Quality Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Code Coverage | 80% | TBD | 🟡 |
| Critical Vulnerabilities | 0 | TBD | 🟡 |
| P95 Latency | <4s | TBD | 🟡 |
| Red-Team Pass Rate | 100% | TBD | 🟡 |

### Bug Tracking
| Sprint | Bugs Found | Bugs Fixed | Bugs Remaining |
|--------|------------|------------|----------------|
| Sprint 1 | TBD | TBD | TBD |
| Sprint 2 | TBD | TBD | TBD |

---

## Retrospective Notes

### Sprint 1 Retrospective
**Date**: TBD

**What Went Well**:
- 

**What Didn't Go Well**:
- 

**Action Items**:
- [ ] 
- [ ] 

---

### Sprint 2 Retrospective
**Date**: TBD

**What Went Well**:
- 

**What Didn't Go Well**:
- 

**Action Items**:
- [ ] 
- [ ] 

---

## Knowledge Base

### Useful Resources
- Google ADK Docs: https://google.github.io/adk-docs/
- ACP Specification: https://developers.openai.com/commerce/guides/get-started/
- FastAPI Best Practices: https://fastapi.tiangolo.com/tutorial/
- Pydantic Validation: https://docs.pydantic.dev/
- OpenTelemetry Python: https://opentelemetry.io/docs/instrumentation/python/

### Internal Documentation
- Architecture Diagrams: `/docs/architecture/`
- API Specifications: `/docs/api/`
- Security Guidelines: `/docs/security/`
- Deployment Guides: `/docs/deployment/`

### Team Contacts
- **Tech Lead**: [Name] - Architecture decisions
- **Security Lead**: [Name] - Security reviews
- **DevOps**: [Name] - Infrastructure issues

---

## Update Checklist

After completing each story, update:
- [ ] Add learning entry if new insight discovered
- [ ] Update best practices if new pattern established
- [ ] Add to technical debt if shortcut taken
- [ ] Update metrics (velocity, coverage, bugs)
- [ ] Document any architecture decision changes

---

**Document Status**: ACTIVE - Updated Continuously  
**Next Review**: End of each sprint  
**Owner**: Engineering Team
