import Search from './models/Search';
import Recipe from './models/Recipe';
import * as SearchView from './views/SearchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import * as View from './views/listView';
import { elements, renderLoader , clearLoader } from './views/base';
import List from './models/List';
import Likes from './models/Likes';

//global state of the app

// search object

//current recipes

// shopping list 


// likes recipes

const state = {};
const controlSearch = async () => {
    //1) get query from the view
    const query = SearchView.getInput();
    if(query) {
        //2) new search object and add to state
        state.search = new Search(query);
        //3) prepare UI for results
        SearchView.clearInput () ;
        SearchView.clearResult () ;
        renderLoader(elements.searchRes);
        try {
        //4) search from recipes
        await state.search.getResults();


        //5) render results on the UI
        clearLoader();
        SearchView.renderResults(state.search.result);
        } catch(error) {
            alert (error) 
        }
    }
}
elements.searchForm.addEventListener('submit',e => {
    e.preventDefault();
    controlSearch();

});
elements.searchResPages.addEventListener('click' , e => {
   const btn = e.target.closest('.btn-inline ')
   if(btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    SearchView.clearResult () ;
    SearchView.renderResults(state.search.result , goToPage);
   } 
});
// Recipe controller 
const controlRecipe = async() => {
    const id = window.location.hash.replace('#', '');
    if(id) {
// prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

// highlighted selected search item
 if(state.search) SearchView.highlightSelected(id);


// create new recipe object 
     state.recipe = new Recipe(id);
try{
// get recipe data and parse ingredients
     await state.recipe.getRecipe();
     state.recipe.parseIngredients();


// calculate servings and time
     state.recipe.calcTime();
     state.recipe.calcServings(); 
//render recipe
     clearLoader();
     recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
        );

    }catch(error) {
    console.log(error)
    alert ('Error processing recipe') ;
    }
  }
};
    // window.addEventListener('hashchange', controlRecipe);
    // window.addEventListener('load' , controlRecipe); 
     ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe)); 
     // List controller
     const controlList = () => {
        if(!state.list) state.list = new List();
        // add each ingredient to the list and user interface
        state.recipe.ingredients.forEach(el => {
           const item = state.list.addItem(el.count , el.unit,el.ingredient);
           listView.renderItem(item);
        })
     }
    // Handle delete and update list item events
    elements.shopping.addEventListener('click', e=> {
        const id = e.target.closest('.shopping__item').dataset.itemid;

        // Handle delete button
        if(e.target.matches('.shopping__delete, .shopping__delete *')) {
            // delete from state
            state.list.deleteItem(id);
            // delete from Ui
            listView.deleteItem(id);
            // Handle the count update
        } else if (e.target.matches('.shopping__count-value')){
            
                       
            const val = parseFloat(e.target.value, 10);
            //val < 0 ? state.list.updateCount(id , 0) : state.list.updateCount(id , val);


              
          
            } 
                
            
            
        }
    )
    /// like controller
    


    const controlLike = () => {
        if(!state.likes) state.likes = new Likes();
        const currentID = state.recipe.id;
        // user as not yet liked current recipe
        if(!state.likes.isLiked(currentID)) {
            // add like to the state
        const newLike = state.likes.addLike (
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
            // toggle the like button
            likesView.toggleLikeBtn(true);

            // add like to the UI list 
            likesView.renderLike(newLike);
            // User has liked current recipe
            //likesView.renderLike(newLike) ;
        } else {
            // remove like from the state
            state.likes.deleteLike(currentID);
            //state.likes.deleteLike(currentID);


            // Toggle the like button
            likesView.toggleLikeBtn(false);


            // remove like from UI list 
            likesView.deleteLike(currentID) 
       }
       likesView.toggleLikeMenu(state.likes.getNumLikes());
    };
     // Restore liked recipes on page load
     window.addEventListener('load', () => {
        state.likes = new Likes();
        // restore likes
        state.likes.readStorage();
        // toggle like menu button
        likesView.toggleLikeMenu(state.likes.getNumLikes());

        // render the exist likes
        state.likes.likes.forEach(like => likesView.renderLike(like))
     })

     // Handling recipe button clicks 
     elements.recipe.addEventListener('click', e => {
        if(e.target.matches('.btn-decrease, .btn-decrease *')) {
            // dercrease the servings 
            if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec')
            recipeView.updateServingsIngredients(state.recipe);
            
             } /*if(state.list.count > 1) {
                state.list.updateCount(id, count, 'dec')
             } */
                
             
        } 
        else if (e.target.matches('.btn-increase, .btn-increase *')) {
            state.recipe.updateServings('inc');
            recipeView.updateServingsIngredients(state.recipe);
            //state.list.updateCount(id, count, 'inc')

        } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
            // add ingredients to shopping list 

            controlList();
        } else if (e.target.matches('.recipe__love, .recipe__love *')) {
            // like controller
            controlLike () ;

        }
     });
     
