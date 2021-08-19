const { deployArtifactUrl, provisioningArtifactUrl } = require('./artifactory');

describe('artifactory', () => {

  beforeEach(() => {
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2021-08-19T11:26:06.000Z');
  });

  const TEST_CASES = [
    {
      name: 'opbox-web',
      version: '1.0.0',
      branch: 'master',
      snapshot: false,
      deployUrl: 'https://bgalek:password@company.artifactory/artifactory/allegro-releases-local/pl/allegro/opbox/opbox-web/1.0.0/opbox-web-1.0.0-deploy.zip',
      provisioningUrl: 'https://bgalek:password!%40%23@company.artifactory/artifactory/allegro-releases-local/pl/allegro/opbox/opbox-web/1.0.0/opbox-web-1.0.0-provisioning.zip'
    },
    {
      name: 'opbox-web',
      version: '1.0.0',
      branch: 'my-branch',
      snapshot: true,
      deployUrl: 'https://bgalek:password@company.artifactory/artifactory/allegro-snapshots-local/pl/allegro/opbox/opbox-web/1.0.0-my-branch-SNAPSHOT/opbox-web-1.0.0-my-branch-20210819.112606-deploy.zip',
      provisioningUrl: 'https://bgalek:password!%40%23@company.artifactory/artifactory/allegro-snapshots-local/pl/allegro/opbox/opbox-web/1.0.0-my-branch-SNAPSHOT/opbox-web-1.0.0-my-branch-20210819.112606-provisioning.zip'
    },
    {
      name: 'listing-mobile-bff',
      version: '1.0.0',
      branch: 'master',
      snapshot: false,
      deployUrl: 'https://bgalek:password@company.artifactory/artifactory/allegro-releases-local/pl/allegro/opbox/listing-mobile-bff/1.0.0/listing-mobile-bff-1.0.0-deploy.zip',
      provisioningUrl: 'https://bgalek:password!%40%23@company.artifactory/artifactory/allegro-releases-local/pl/allegro/opbox/listing-mobile-bff/1.0.0/listing-mobile-bff-1.0.0-provisioning.zip'
    },
    {
      name: 'listing-mobile-bff',
      version: '1.0.0',
      branch: 'feature/my-branch',
      snapshot: true,
      deployUrl: 'https://bgalek:password@company.artifactory/artifactory/allegro-snapshots-local/pl/allegro/opbox/listing-mobile-bff/1.0.0-feature-my-branch-SNAPSHOT/listing-mobile-bff-1.0.0-feature-my-branch-20210819.112606-deploy.zip',
      provisioningUrl: 'https://bgalek:password!%40%23@company.artifactory/artifactory/allegro-snapshots-local/pl/allegro/opbox/listing-mobile-bff/1.0.0-feature-my-branch-SNAPSHOT/listing-mobile-bff-1.0.0-feature-my-branch-20210819.112606-provisioning.zip'
    },
    {
      name: 'opbpox-core',
      version: '1',
      branch: 'feature/my-branch',
      snapshot: true,
      deployUrl: 'https://bgalek:password@company.artifactory/artifactory/allegro-snapshots-local/pl/allegro/opbox/opbpox-core/1-feature-my-branch-SNAPSHOT/opbpox-core-1-feature-my-branch-20210819.112606-deploy.zip',
      provisioningUrl: 'https://bgalek:password!%40%23@company.artifactory/artifactory/allegro-snapshots-local/pl/allegro/opbox/opbpox-core/1-feature-my-branch-SNAPSHOT/opbpox-core-1-feature-my-branch-20210819.112606-provisioning.zip'
    },
    {
      name: 'opbpox-core',
      version: '5',
      branch: 'master',
      snapshot: false,
      deployUrl: 'https://bgalek:password@company.artifactory/artifactory/allegro-releases-local/pl/allegro/opbox/opbpox-core/5/opbpox-core-5-deploy.zip',
      provisioningUrl: 'https://bgalek:password!%40%23@company.artifactory/artifactory/allegro-releases-local/pl/allegro/opbox/opbpox-core/5/opbpox-core-5-provisioning.zip'
    }
  ];

  TEST_CASES.forEach(testcase => {
    test(`should return valid deploy url for ${testcase.name}, ${testcase.version}, ${testcase.branch}`, () => {
      //given
      const artifactUrl = deployArtifactUrl('bgalek', 'password', 'company.artifactory', 'pl.allegro.opbox', testcase.name, testcase.version, testcase.branch, testcase.snapshot).toString();
      // expect
      expect(artifactUrl).toBe(testcase.deployUrl);
    });
  });

  TEST_CASES.forEach(testcase => {
    test(`should return valid provisioningUrl url for ${testcase.name}, ${testcase.version}, ${testcase.branch}`, () => {
      //given
      const artifactUrl = provisioningArtifactUrl('bgalek', 'password!@#', 'company.artifactory', 'pl.allegro.opbox', testcase.name, testcase.version, testcase.branch, testcase.snapshot).toString();
      // expect
      expect(artifactUrl).toBe(testcase.provisioningUrl);
    });
  });
});
