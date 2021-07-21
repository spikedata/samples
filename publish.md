# How to publish changes to @spike/api-core, @spike/api-statements, @spike/global, @spike/pdf-cli

```sh
cd /spike/v9/statements
yarn run publish # NOTE: NOT `yarn publish`
```

## How to update @spike/priv to use latest public libs

```sh
cd /spike/v9/priv
# yarn add -W @spike/api @spike/global
yarn install
/spike/v9/priv/scripts/workspace/rm-node-modules-spike.sh
```
