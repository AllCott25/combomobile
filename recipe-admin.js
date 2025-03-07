// Recipe Admin Interface for Culinary Logic Puzzle
// This file handles the admin interface for creating and uploading new recipe puzzles

// Initialize Supabase client
const SUPABASE_URL = 'https://ovrvtfjejmhrflybslwi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cnZ0Zmplam1ocmZseWJzbHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNDkxMDgsImV4cCI6MjA1NjYyNTEwOH0.V5_pJUQN9Xhd-Ot4NABXzxSVHGtNYNFuLMWE1JDyjAk';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const recipeForm = document.getElementById('recipe-form');
const recipeName = document.getElementById('recipe-name');
const recipeUrl = document.getElementById('recipe-url');
const recipeDate = document.getElementById('recipe-date');
const combinationsContainer = document.getElementById('combinations-container');
const addCombinationBtn = document.getElementById('add-combination-btn');
const finalCombinationsList = document.getElementById('final-combinations-list');
const generatePreviewBtn = document.getElementById('generate-preview-btn');
const previewContainer = document.getElementById('preview-container');
const clearFormBtn = document.getElementById('clear-form-btn');
const testRecipeBtn = document.getElementById('test-recipe-btn');
const saveRecipeBtn = document.getElementById('save-recipe-btn');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Templates
const combinationTemplate = document.getElementById('combination-template').innerHTML;
const ingredientTemplate = document.getElementById('ingredient-template').innerHTML;

// Global variables
let combinationCounter = 0;
let ingredientCounter = 0;
let currentUser = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    // Check if user is already logged in
    checkAuthState();
    
    // Set today's date as the default
    const today = new Date().toISOString().split('T')[0];
    recipeDate.value = today;
    
    // Add event listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    addCombinationBtn.addEventListener('click', addCombination);
    generatePreviewBtn.addEventListener('click', generatePreview);
    clearFormBtn.addEventListener('click', clearForm);
    testRecipeBtn.addEventListener('click', testRecipe);
    recipeForm.addEventListener('submit', saveRecipe);
    
    // Add event delegation for dynamic elements
    document.addEventListener('click', handleDynamicClicks);
}

// Authentication Functions
async function checkAuthState() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error('Error checking auth state:', error);
        showLoginSection();
        return;
    }
    
    if (user) {
        currentUser = user;
        showAdminSection();
    } else {
        showLoginSection();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        currentUser = data.user;
        showAdminSection();
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = error.message || 'Failed to login. Please check your credentials.';
        loginError.classList.remove('d-none');
    }
}

async function handleLogout() {
    try {
        await supabase.auth.signOut();
        currentUser = null;
        showLoginSection();
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to logout. Please try again.');
    }
}

function showLoginSection() {
    loginSection.classList.remove('d-none');
    adminSection.classList.add('d-none');
    loginError.classList.add('d-none');
    loginForm.reset();
}

function showAdminSection() {
    loginSection.classList.add('d-none');
    adminSection.classList.remove('d-none');
}

// Form Handling Functions
function handleDynamicClicks(event) {
    // Handle remove combination button
    if (event.target.classList.contains('remove-combination-btn')) {
        const combinationItem = event.target.closest('.combination-item');
        combinationItem.remove();
        updateFinalCombinationsList();
    }
    
    // Handle add ingredient button
    if (event.target.classList.contains('add-ingredient-btn')) {
        const combinationItem = event.target.closest('.combination-item');
        const ingredientsContainer = combinationItem.querySelector('.ingredients-container');
        addIngredient(ingredientsContainer);
    }
    
    // Handle remove ingredient button
    if (event.target.classList.contains('remove-ingredient-btn')) {
        const ingredientItem = event.target.closest('.ingredient-item');
        ingredientItem.remove();
    }
}

function addCombination() {
    combinationCounter++;
    const id = `combination-${combinationCounter}`;
    const html = combinationTemplate.replace(/{id}/g, id);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const combinationItem = tempDiv.firstElementChild;
    
    combinationsContainer.appendChild(combinationItem);
    
    // Add at least two ingredients by default
    const ingredientsContainer = combinationItem.querySelector('.ingredients-container');
    addIngredient(ingredientsContainer);
    addIngredient(ingredientsContainer);
    
    // Update the final combinations list
    updateFinalCombinationsList();
}

function addIngredient(container) {
    ingredientCounter++;
    const id = `ingredient-${ingredientCounter}`;
    const html = ingredientTemplate.replace(/{id}/g, id);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const ingredientItem = tempDiv.firstElementChild;
    
    container.appendChild(ingredientItem);
}

function updateFinalCombinationsList() {
    // Clear the current list
    finalCombinationsList.innerHTML = '';
    
    // Get all combination names
    const combinations = Array.from(document.querySelectorAll('.combination-item'));
    
    if (combinations.length === 0) {
        finalCombinationsList.innerHTML = '<div class="form-text text-muted">Add intermediate combinations first</div>';
        return;
    }
    
    // Create checkboxes for each combination
    combinations.forEach(combination => {
        const nameInput = combination.querySelector('.combination-name');
        const name = nameInput.value || 'Unnamed Combination';
        const id = combination.dataset.combinationId;
        
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'form-check';
        checkboxDiv.innerHTML = `
            <input class="form-check-input final-combination-checkbox" type="checkbox" value="${id}" id="final-${id}" checked>
            <label class="form-check-label" for="final-${id}">
                ${name}
            </label>
        `;
        
        finalCombinationsList.appendChild(checkboxDiv);
        
        // Update checkbox label when combination name changes
        nameInput.addEventListener('input', () => {
            const label = document.querySelector(`label[for="final-${id}"]`);
            if (label) {
                label.textContent = nameInput.value || 'Unnamed Combination';
            }
        });
    });
}

function generatePreview() {
    try {
        const recipeData = getFormData();
        
        if (!validateRecipeData(recipeData)) {
            return;
        }
        
        // Generate preview HTML
        let previewHtml = `
            <h5>${recipeData.name}</h5>
            <p><strong>Date:</strong> ${recipeData.date}</p>
            <hr>
            <h6>Base Ingredients:</h6>
            <div class="mb-3">
        `;
        
        // Add all base ingredients
        const allIngredients = [...new Set(recipeData.intermediateCombinations.flatMap(c => c.required))];
        allIngredients.forEach(ingredient => {
            previewHtml += `<span class="vessel vessel-white">${ingredient}</span>`;
        });
        
        previewHtml += `</div><h6>Intermediate Combinations:</h6>`;
        
        // Add intermediate combinations
        recipeData.intermediateCombinations.forEach(combo => {
            previewHtml += `<div class="mb-3">`;
            
            // Add ingredients
            combo.required.forEach((ingredient, index) => {
                previewHtml += `<span class="vessel vessel-white">${ingredient}</span>`;
                if (index < combo.required.length - 1) {
                    previewHtml += `<span class="combination-arrow">+</span>`;
                }
            });
            
            previewHtml += `<span class="combination-arrow">→</span>`;
            previewHtml += `<span class="vessel vessel-green">${combo.name}</span>`;
            previewHtml += `</div>`;
        });
        
        // Add final combination
        previewHtml += `<h6>Final Recipe:</h6><div class="mb-3">`;
        recipeData.finalCombination.required.forEach((comboName, index) => {
            previewHtml += `<span class="vessel vessel-green">${comboName}</span>`;
            if (index < recipeData.finalCombination.required.length - 1) {
                previewHtml += `<span class="combination-arrow">+</span>`;
            }
        });
        
        previewHtml += `<span class="combination-arrow">→</span>`;
        previewHtml += `<span class="vessel vessel-green">${recipeData.finalCombination.name}</span>`;
        previewHtml += `</div>`;
        
        // Show the preview
        previewContainer.innerHTML = previewHtml;
        previewContainer.classList.remove('d-none');
        
        // Scroll to preview
        previewContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Preview generation error:', error);
        showError('Failed to generate preview: ' + error.message);
    }
}

function getFormData() {
    // Get basic recipe information
    const name = recipeName.value.trim();
    const url = recipeUrl.value.trim();
    const date = recipeDate.value;
    
    // Get intermediate combinations
    const intermediateCombinations = [];
    const combinationElements = document.querySelectorAll('.combination-item');
    
    combinationElements.forEach(combinationElement => {
        const combinationName = combinationElement.querySelector('.combination-name').value.trim();
        const ingredientElements = combinationElement.querySelectorAll('.ingredient-item');
        const ingredients = [];
        
        ingredientElements.forEach(ingredientElement => {
            const ingredientName = ingredientElement.querySelector('.ingredient-name').value.trim();
            if (ingredientName) {
                ingredients.push(ingredientName);
            }
        });
        
        if (combinationName && ingredients.length > 0) {
            intermediateCombinations.push({
                name: combinationName,
                required: ingredients
            });
        }
    });
    
    // Get final combination
    const finalCombinationCheckboxes = document.querySelectorAll('.final-combination-checkbox:checked');
    const requiredCombinations = [];
    
    finalCombinationCheckboxes.forEach(checkbox => {
        const combinationId = checkbox.value;
        const combinationElement = document.querySelector(`[data-combination-id="${combinationId}"]`);
        if (combinationElement) {
            const combinationName = combinationElement.querySelector('.combination-name').value.trim();
            if (combinationName) {
                requiredCombinations.push(combinationName);
            }
        }
    });
    
    return {
        name,
        url: url || null,
        date,
        intermediateCombinations,
        finalCombination: {
            name,
            required: requiredCombinations
        }
    };
}

function validateRecipeData(data) {
    // Check basic recipe information
    if (!data.name) {
        showError('Recipe name is required');
        return false;
    }
    
    if (!data.date) {
        showError('Publication date is required');
        return false;
    }
    
    // Check intermediate combinations
    if (data.intermediateCombinations.length === 0) {
        showError('At least one intermediate combination is required');
        return false;
    }
    
    // Check for duplicate combination names
    const combinationNames = data.intermediateCombinations.map(c => c.name);
    if (new Set(combinationNames).size !== combinationNames.length) {
        showError('Duplicate combination names are not allowed');
        return false;
    }
    
    // Check final combination
    if (data.finalCombination.required.length === 0) {
        showError('At least one combination is required for the final recipe');
        return false;
    }
    
    return true;
}

async function testRecipe(event) {
    event.preventDefault();
    
    try {
        const recipeData = getFormData();
        
        if (!validateRecipeData(recipeData)) {
            return;
        }
        
        // Create a test URL with the recipe data
        const testData = {
            recipeName: recipeData.name,
            recipeUrl: recipeData.url || 'https://example.com/recipe',
            intermediateCombinations: recipeData.intermediateCombinations,
            finalCombination: recipeData.finalCombination,
            baseIngredients: [...new Set(recipeData.intermediateCombinations.flatMap(c => c.required))]
        };
        
        // Create a data URL with the test data
        const dataUrl = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(testData));
        
        // Open the playtest page with the test data
        window.open(`playtest.html?data=${encodeURIComponent(dataUrl)}`, '_blank');
    } catch (error) {
        console.error('Test recipe error:', error);
        showError('Failed to test recipe: ' + error.message);
    }
}

async function saveRecipe(event) {
    event.preventDefault();
    
    try {
        // Check if user is authenticated
        if (!currentUser) {
            showError('You must be logged in to save recipes');
            return;
        }
        
        const recipeData = getFormData();
        
        if (!validateRecipeData(recipeData)) {
            return;
        }
        
        // Show loading state
        saveRecipeBtn.disabled = true;
        saveRecipeBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        
        // 1. Insert the recipe
        const { data: recipeInsert, error: recipeError } = await supabase
            .from('recipes')
            .insert({
                name: recipeData.name,
                recipe_url: recipeData.url,
                date: recipeData.date,
                created_by: currentUser.id
            })
            .select();
        
        if (recipeError) {
            throw new Error(`Recipe insert error: ${recipeError.message}`);
        }
        
        if (!recipeInsert || recipeInsert.length === 0) {
            throw new Error('Failed to insert recipe');
        }
        
        const recipeId = recipeInsert[0].rec_id;
        
        // 2. Insert intermediate combinations
        for (const combo of recipeData.intermediateCombinations) {
            // Insert the combination
            const { data: comboInsert, error: comboError } = await supabase
                .from('combinations')
                .insert({
                    rec_id: recipeId,
                    name: combo.name,
                    is_final: false
                })
                .select();
            
            if (comboError) {
                throw new Error(`Combination insert error: ${comboError.message}`);
            }
            
            if (!comboInsert || comboInsert.length === 0) {
                throw new Error('Failed to insert combination');
            }
            
            const comboId = comboInsert[0].combo_id;
            
            // Insert ingredients for this combination
            for (const ingredient of combo.required) {
                const { error: ingredientError } = await supabase
                    .from('ingredients')
                    .insert({
                        combo_id: comboId,
                        name: ingredient,
                        is_base: true
                    });
                
                if (ingredientError) {
                    throw new Error(`Ingredient insert error: ${ingredientError.message}`);
                }
            }
        }
        
        // 3. Insert final combination
        const { data: finalComboInsert, error: finalComboError } = await supabase
            .from('combinations')
            .insert({
                rec_id: recipeId,
                name: recipeData.finalCombination.name,
                is_final: true
            })
            .select();
        
        if (finalComboError) {
            throw new Error(`Final combination insert error: ${finalComboError.message}`);
        }
        
        if (!finalComboInsert || finalComboInsert.length === 0) {
            throw new Error('Failed to insert final combination');
        }
        
        const finalComboId = finalComboInsert[0].combo_id;
        
        // Insert required combinations as ingredients for the final combination
        for (const comboName of recipeData.finalCombination.required) {
            const { error: ingredientError } = await supabase
                .from('ingredients')
                .insert({
                    combo_id: finalComboId,
                    name: comboName,
                    is_base: false
                });
            
            if (ingredientError) {
                throw new Error(`Final ingredient insert error: ${ingredientError.message}`);
            }
        }
        
        // Show success message
        showSuccess(`Recipe "${recipeData.name}" saved successfully for ${recipeData.date}`);
        
        // Clear the form
        clearForm();
    } catch (error) {
        console.error('Save recipe error:', error);
        showError('Failed to save recipe: ' + error.message);
    } finally {
        // Reset button state
        saveRecipeBtn.disabled = false;
        saveRecipeBtn.textContent = 'Save Recipe';
    }
}

function clearForm() {
    // Clear basic recipe information
    recipeName.value = '';
    recipeUrl.value = '';
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    recipeDate.value = today;
    
    // Clear combinations
    combinationsContainer.innerHTML = '';
    
    // Reset counters
    combinationCounter = 0;
    ingredientCounter = 0;
    
    // Update final combinations list
    updateFinalCombinationsList();
    
    // Hide preview
    previewContainer.classList.add('d-none');
    previewContainer.innerHTML = '';
    
    // Hide messages
    hideError();
    hideSuccess();
}

// Utility Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
    errorMessage.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.classList.add('d-none');
    errorMessage.textContent = '';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('d-none');
    successMessage.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideSuccess();
    }, 5000);
}

function hideSuccess() {
    successMessage.classList.add('d-none');
    successMessage.textContent = '';
} 