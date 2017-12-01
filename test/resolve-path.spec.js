import test from 'tape';
import path from 'path';
import url from 'url';
import resolvePath from '../src/resolve-path';

test('sanity check', assert => {
    assert.equal(typeof resolvePath, 'function', 'can import resolvePath and it is a function');
    assert.end();
});

test('jspm import', assert => {

    System.config({
        map: {
            'mock-package': 'npm:mock-package@1.0.0',
        }
    });

    const request = {
        current: 'jspm:mock-package/mock-asset',
        previous: 'stdin',
    };

    resolvePath(request, '/')
        .then(p => {
            // System.normalize in resolvePath will give us the absolute path
            const relative = '/' + path.relative(__dirname, url.parse(p).path);
            assert.equal(relative, '/../src/jspm_packages/npm/mock-package@1.0.0/mock-asset.scss', 'resolves "jspm:" import');
        })
        .catch(e => assert.fail(e))
        .then(() => assert.end());
});

test('nested imports', assert => {
    let request = {
        current: 'mixins/mixin',
        previous: '/jspm_packages/npm/mock-package@1.0.0/mock-asset',
    };

    resolvePath(request, '/')
        .then(p => {
            assert.equal(p, '/jspm_packages/npm/mock-package@1.0.0/mixins/mixin.scss', 'resolves a nested import');
        })
        .catch(e => assert.fail(e))
        .then(() => {
            request = {
                current: 'deeper/mixin',
                previous: 'mixins/mixin',
            };

            resolvePath(request, '/')
                .then(p => {
                    assert.equal(p, '/jspm_packages/npm/mock-package@1.0.0/mixins/deeper/mixin.scss', 'resolves a double nested import');
                })
                .catch(e => assert.fail(e))
                .then(() => assert.end());
        });
});
