const { Workflow, Item, storage, utils } = require('alfred-workflow-nodejs-next');
const { openLinkExecutor } = require('./executors.js');
const jsonAPIs = require('./immubtale-js.json');
const DOCS_WEBSITE_CLI = 'https://facebook.github.io/immutable-js/docs/#/';

const commands = {
    LOAD_ALL_LINKS: 'load_all_links',
    OPEN_LINK: 'open_link',
    CLEAR_CACHE: 'clear_cache'
};

(function initWorkflow() {
    const workflow = new Workflow();
    workflow.setName('alfred-wf-yarn-api-search');

    workflow.onAction(commands.LOAD_ALL_LINKS, (query) => loadAllLinks(workflow, query));
    workflow.onAction(commands.CLEAR_CACHE, () => storage.clear());

    workflow.onAction(commands.OPEN_LINK, (arg) => {
        if (typeof arg === 'string') {
            openLinkExecutor.execute(JSON.parse(arg));
        } else {
            openLinkExecutor.execute(arg);
        }
    });

    workflow.start();
}());

function loadAllLinks(workflow, query) {
    const items = [];

    for (let key in jsonAPIs) {
        const value1 = jsonAPIs[key];
        if (typeof value1 === 'string') {
            items.push(createItem(key, value1));
        } else {
            for (let key2 in value1) {
                const value2 = value1[key2];
                items.push(createItem(key + ' - ' + key2, value2));
            }
        }
    }

    const filteredItems = utils.filter(query, items, (item) => item.get('title'));

    workflow.addItems(filteredItems);
    workflow.feedback();
}

function createItem(title, subtitle) {
    let apiPath = title.replace(' - ', '/');
    // transform 'Map/Map.isMap --> Map/isMap'
    if (apiPath.includes('/') && apiPath.includes('.')) {
        apiPath = apiPath.slice(0, apiPath.indexOf('/') + 1) + apiPath.slice(apiPath.indexOf('.') + 1);
    }

    const url = `${DOCS_WEBSITE_CLI}${apiPath}`;

    return new Item({
        uid: url,
        title,
        subtitle: subtitle ? subtitle : url,
        valid: true,
        hasSubItems: false,
        arg: {
            // Default: open Yarn website link
            actionName: 'open_link',
            link: url
        }
    });
}