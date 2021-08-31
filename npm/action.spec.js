jest.mock('child_process', () => ({ execSync: jest.fn() }));

const { execSync } = require('child_process');
const action = require('./action');

const TEST_DATE = new Date('2021-08-19T12:34:56Z');

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly setup npm before publishing', () => {
    // when
    action({
      host: 'company.artifactory.allegro',
      email: 'test-user@allegro.pl',
      username: 'test-user-legacy@allegro.pl',
      password: 'test-user-password',
      packageVersion: '1.2.3',
      branchName: 'main',
      currentDate: TEST_DATE,
    });

    // then
    expect(process.env['npm_config_registry']).toBe('https://company.artifactory.allegro/artifactory/api/npm/group-npm');
    expect(process.env['npm_config_always_auth']).toBe('true');
    expect(process.env['npm_config__auth']).toBe('test-user-password');
    expect(process.env['npm_config_email']).toBe('test-user@allegro.pl');
  });

  test('should setup email from "username" when "email" is not provided', () => {
    // when
    action({
      host: 'company.artifactory.allegro',
      username: 'test-user-legacy@allegro.pl',
      password: 'test-user-password',
      packageVersion: '1.2.3',
      branchName: 'main',
      currentDate: TEST_DATE,
    });

    // then
    expect(process.env['npm_config_registry']).toBe('https://company.artifactory.allegro/artifactory/api/npm/group-npm');
    expect(process.env['npm_config_always_auth']).toBe('true');
    expect(process.env['npm_config__auth']).toBe('test-user-password');
    expect(process.env['npm_config_email']).toBe('test-user-legacy@allegro.pl');
  });

  [
    {
      inputData: {
        packageVersion: '1.2.3',
        branchName: 'main',
      },
      expectedCommands: [
        ['npm publish --tag latest'],
      ],
      expectedInfo: {
        version: '1.2.3',
        tag: 'latest',
      },
    }, {
      inputData: {
        packageVersion: '1.2.3',
        branchName: 'master',
      },
      expectedCommands: [
        ['npm publish --tag latest'],
      ],
      expectedInfo: {
        version: '1.2.3',
        tag: 'latest',
      },
    }, {
      inputData: {
        packageVersion: '1.2.3',
        branchName: 'feature/TICKET-6789-test-feature',
      },
      expectedCommands: [
        ['npm --no-git-tag-version version 1.2.3-feature-TICKET-6789-test-feature.20210819123456'],
        ['npm publish --tag feature-TICKET-6789-test-feature'],
      ],
      expectedInfo: {
        version: '1.2.3-feature-TICKET-6789-test-feature.20210819123456',
        tag: 'feature-TICKET-6789-test-feature',
      },
    }, {
      inputData: {
        packageVersion: '1.2.3',
        branchName: 'branch/name/with/lots/of/slashes',
      },
      expectedCommands: [
        ['npm --no-git-tag-version version 1.2.3-branch-name-with-lots-of-slashes.20210819123456'],
        ['npm publish --tag branch-name-with-lots-of-slashes'],
      ],
      expectedInfo: {
        version: '1.2.3-branch-name-with-lots-of-slashes.20210819123456',
        tag: 'branch-name-with-lots-of-slashes',
      },
    }
  ].forEach(({ inputData, expectedCommands, expectedInfo }) => {
    test(`should correctly publish package with version ${inputData.packageVersion} from ${inputData.branchName} branch`, () => {
      // when
      const info = action({
        currentDate: TEST_DATE,
        ...inputData,
      });

      // then
      expect(execSync.mock.calls).toEqual(expectedCommands);
      expect(info).toEqual(expectedInfo);
    });
  });
});
