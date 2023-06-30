# External Sequenced Assembly

[![kjspkg-available](https://github-production-user-asset-6210df.s3.amazonaws.com/79367505/250114674-fb848719-d52e-471b-a6cf-2c0ea6729f1c.svg)](https://kjspkglookup.modernmodpacks.site/#create-external-sequenced-assembly)

"This script is accursed" --Emperdog

## Examples

```js
// Example of Ext Sequence Recipe using JSON-based and KJS builtin/Functions
onEvent('recipes', (event) => {
    global.addExtSequenceRecipe(['minecraft:diamond'], 'minecraft:gravel',
        [
            // Adds a standard Sequenced Assembly Pressing step.
            {
                'type': 'press'
            },

            // Adds a standard Sequenced Assembly Cutting step, time element is required.
            {
                'type': 'cut',
                'time': 50
            },

            // Adds an External step in JSON format, to smith Iron Bars with the Sequence's Transitional Item
            {
                'type': 'external',

                // External steps add a "fake" Deploying Step which is intended to not be able to actually be performed, the dummy and info elements define what is shown as the "input" for this impossible step.
                'dummy': 'minecraft:smithing_table',
                // Info is written in JSON Text Component structure, it may be tedious to write, but it allows an incredible degree of customization with minimal work on the side of script devlopment.
                'info': [{
                    'translate': `${packID}.external_sequencing.extsequence_test.3.smithing.info`,
                    'color': 'gold',
                    'bold': true
                }],

                // a Flag element to define if the recipe should JSON-ify the "post" and "pre" items for this step.
                // Will act as if false if it is not found, but will print a warning in the KJS server log.
                'json_format': true,

                //A variable-assigned function for the External step's recipe, using a Smithing JSON recipe definition.
                'recipedata': (post, pre, id) => event.custom({
                    //Smithing is funky since it copies the base's NBT to the output, so you need to put the input as the secondary, and can't have NBT on the base, unless you want to have an impossible step
                    'type': 'minecraft:smithing',
                    'base': { 'item': 'minecraft:iron_bars' },
                    'addition': pre,
                    'result': post
                }).id(id)
            },

            // Adds a standard Sequenced Assembly Filling step.
            {
                'type': 'fill',
                'fluid': Fluid.of('minecraft:water', 500)
            },

            // Adds a standard Sequenced Assembly Deploying step
            {
                'type': 'deploy',
                'input': 'minecraft:iron_block',
                // keepItem element sets the 'keepHeldItem' property in the recipe, which determines if the item will be consumed when deployed onto the sequence item.
                // will act as if false if it is not found.
                'keepItem': true
            },

            // Adds an External step using a native KJS method.
            {
                'type': 'external',
                'dummy': 'minecraft:furnace',
                'info': [
                    [{
                        'text': 'Process item in ',
                        'color': '#FF0000'
                    },
                    {
                        'text': 'this ',
                        'color': 'aqua'
                    },
                    {
                        'text': 'Device!',
                        'color': '#FF0000'
                    }],
                    [{
                        'text': 'Smoker and Blast Furnace ',
                        'color': 'gold'
                    },
                    {
                        'text': 'are not valid!',
                        'color': 'red'
                    }]
                ],
                'json_format': false,

                //Variable-assigned function using the native KJS method for Furnace recipes
                'recipedata': (post, pre, id) => event.smelting(post, pre).id(id)
            }
        ],
    // Amount of Sequence Loops in the recipe
        2,
    
    // "Transitional Item" of the recipe.
        'minecraft:flint',

    // Recipe's ID, used in both the IDs of the steps and the actual recipe.
        'extsequence_test',

    // a Recipe Event, so that Recipe Event methods and functions can be executed inside of the function properly.
        event
    )
    
})
```

```js
// Example using recipetype that supports full output Arrays as final step.
onEvent('recipes', (event => {
    global.addExtSequenceRecipe(['minecraft:dirt', 'minecraft:grass'], 'minecraft:grass_block',
        [
            {
                'type': 'press'
            },
            {
                'type': 'external',
                'dummy': 'create:millstone',
                'info': [
                    {
                        'text': 'Centrifuge in a Mechanical Mixer.',
                        'color': 'gold'
                    },
                    [{
                        'text': 'This step outputs ',
                        'color': 'gold'
                    },
                    {
                        'text': 'Multiple items!',
                        'color': '#DB3DD6'
                    }]
                ],
                // Uses the full array of outputs given as the result of the absolute final step, instead of just the first entry.
                // not necessary in recipes with a Loop count of 1, but essential in recipes with an actual number of loops.
                // will act as if false if it does not exist, and will not log anything, unlike json_format.
                'outputisarray': true,
                'json_format': false,
                'recipedata': (post, pre, id) => event.recipes.createMixing(post, [pre]).id(id)
            }
        ],
    1, 'minecraft:grass_block', 'extsequence/outputisarray_showcase', event)
}))
```
