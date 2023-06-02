// priority: 5

// External Sequencing Script Version: 1.1.2
/*
    TODO

    Send External Step Recipe IDs from Server to Client to hide
    
    Tooltip system for Ext Sequence recipes when Create is not installed (aka the -C edition)
    
    Option to not send First Loop and/or Final Step Recipe IDs
*/

//Sequencing

// Namespace to use for recipes created by this function
var packID = 'empercog';

// for a future feature, automatic hiding of External Sequence step recipes from JEI to reduce clutter in JEI.
// cause do you really need 50 pages of basically the same recipe thanks to your 200 loop sequence?
var autoHideExtSteps = true;

var createLoaded = Platform.isLoaded('create');
var extStepRecipeIDs = [];

/**
@param {ItemStackJS[] / string[]} outputs
@param {IngredientJS / string} base
@param {map[]} sequence
@param {int} seqLoops
@param {string} transitional
@param {string} id
@param {RecipeEventJS} event
*/
const addExtSequenceRecipe = (outputs, base, sequence, seqLoops, transitional, id, event) => {
    
    let constructedSequence = [];
    let sequenceStep = 1;
    let totalSteps = sequence.length * seqLoops;
    
    console.log('Beginning addition of Recipe \''+ packID +':sequencing/'+ id +'\' with '+ sequence.length +' Steps and '+ seqLoops +' Loops. (total of '+ totalSteps +' steps)');
    
    sequence.forEach((step) => {
        
        let estStep = sequenceStep;
        
        // Normal Sequencing steps
        if(createLoaded){
            switch(step.type) {
                case 'deploy':
                    if(step.keepItem){
                        constructedSequence.push(event.recipes.createDeploying(transitional, [transitional, step.input]).keepHeldItem());
                    } else {
                        constructedSequence.push(event.recipes.createDeploying(transitional, [transitional, step.input]));
                    }
                    break;
                case 'press':
                    constructedSequence.push(event.recipes.createPressing(transitional, transitional));
                    break;
                case 'cut':
                    constructedSequence.push(event.recipes.createCutting(transitional, transitional).processingTime(step.time));
                    break;
                case 'fill':
                    constructedSequence.push(event.recipes.createFilling(transitional, [transitional, step.fluid]));
                    break;
                case 'external':
                    break;
                default:
                    console.log(`Invalid Step Type "${step.type}" in sequenced recipe "${id}"!`);
                    break;
            }
        }
        //External Sequencing
        if(step.type == 'external'){
            
            //Dummy Lore Assembly
            if(createLoaded){
                let constructedLore = [];
                let newPart = '';

                // Construct Lore data from Info array
                step.info.forEach((component) => {
                    if(component.length > 0) newPart = Utils.listOf(component).toJson();
                    if(component.length == undefined) newPart = Utils.mapOf(component).toJson();
                    constructedLore.push(`'${newPart}'`);

                    // Old lore system, it's sitting here if you need to use it for retrofitting, but this will be taken out in the near future
                    /*
                    component.split('|').forEach((part) => {
                        let info = part.split("%$");
                        newPart.push(`{"text": "${info[1]}", "color": "${info[0]}"}`);
                    })
                    constructedLore.push('\'['+ newPart.toString() +']\'');
                    //*/
                })
                // Push Dummy step to Sequence
                constructedSequence.push(event.recipes.createDeploying(transitional, [transitional, Item.of(step.dummy, `{display:{Lore:[${constructedLore}]},Unobtainble:1b}`)]));
            }
            
            // Begin creating External Step(s)
            
            while (estStep <= totalSteps) {
                //Determine Progress float values for Input and Output of upcoming recipe
                let estProgress = (1 / (totalSteps / (estStep - 1))) + 'f';
                let nextProgress = (1 / (totalSteps / estStep)) + 'f';
                
                let genID = `${packID}:external_sequencing/${id}/step_${estStep}`;
                
                extStepRecipeIDs.push(genID);
                
                global.sequenceRecipeIDsToHide.push(genID);
                
                let preItem = '';
                let postItem = '';
                
                //Check if current Step is the first, if it is, use the "Base" item as the Input of the step
                if(sequenceStep != 1){
                    preItem = Item.of(transitional, `{SequencedAssembly:{Progress:${estProgress},Step:${(estStep -1)},id:"${packID}:sequencing/${id}"}}`);
                } else {
                    preItem = base;
                }
                
                //Check if current Step is the last, if it is, use the first "Output" item as the Result of the step
                if(estStep != totalSteps){
                    postItem = Item.of(transitional, `{SequencedAssembly:{Progress:${nextProgress},Step:${estStep},id:"${packID}:sequencing/${id}"}}`);
                } else if(step.outputisarray){
                    //this is technically a useless feature for one-loop recipes, since you can achieve the same effect by defining the other items in the final step's recipe, but is essential for recipes with an actual number of loops.
                    postItem = outputs;
                } else {
                    postItem = outputs[0];
                }
                
                //Convert item info to JSON format if value of "json_format" element in step info is true
                if(step.json_format){
                    preItem = preItem.toJson();
                    postItem = postItem.toJson();
                } else if(step.json_format == 'undefined'){
                    console.warn(`External Step #${estStep} in recipe "${genID}" does not have a json_format flag, this may cause errors!`);
                }
                
                //Log External Sequence step info
                console.log(`Adding EXT Sequence Step #${estStep} : ${preItem} --TO-> ${postItem}`);
                
                //Run step recipe
                step.recipedata(postItem, preItem, genID);
                
                //Increase the value of "estStep" as long as it is less than the value of "totalSteps", to make the while loop end when recipes for each loop are registered for this step
                if(estStep <= totalSteps){
                    estStep += sequence.length;
                }
            }
            
        }
        //Move to next Step
        sequenceStep++;
    })
    //Register Sequence Recipe
    if(createLoaded){
        event.recipes.createSequencedAssembly(outputs, base, constructedSequence).loops(seqLoops).transitionalItem(transitional).id(`${packID}:sequencing/${id}`);
    }
}

onEvent("loaded", e => {
    if(!createLoaded){
        console.log('Create not found! only External Sequencing is available without Create!');
        return
    }

    global.sequenceRecipeIDsToHide = [];
    global.addExtSequenceRecipe = addExtSequenceRecipe;
})