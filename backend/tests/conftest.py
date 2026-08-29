import sys
from os.path import abspath, dirname

# Ensure backend root is on sys.path
backend_dir = dirname(dirname(abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.config import settings
from app.main import app
from app.models.role import Role, RoleEnum
from app.models.user import User
from app.auth.password import get_password_hash

# In-memory SQLite database for fast automated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Seed default roles
    roles = [
        Role(name=RoleEnum.SUPER_ADMIN, display_name="Super Admin"),
        Role(name=RoleEnum.STATE_ADMIN, display_name="State Admin"),
        Role(name=RoleEnum.DISTRICT_OFFICER, display_name="District Officer"),
        Role(name=RoleEnum.TRAINING_PROVIDER, display_name="Training Provider"),
        Role(name=RoleEnum.EMPLOYER, display_name="Employer"),
        Role(name=RoleEnum.CANDIDATE, display_name="Candidate"),
    ]
    for r in roles:
        db.add(r)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
