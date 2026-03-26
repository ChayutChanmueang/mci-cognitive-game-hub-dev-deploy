/**
 * Custom Material Select Component
 * 
 * @param {Object} props
 * @param {string} props.id - Component ID
 * @param {string} props.label - Field Label
 * @param {Array<{value: string, label: string, icon: string}>} props.options - List of options
 * @param {boolean} [props.required=false] - Whether the field is required
 * @returns {string} - HTML Template string
 */
export function createCustomSelectTemplate({ id, label, options = [], required = false }) {
    const optionItems = options.map(opt => `
        <md-menu-item value="${opt.value}">
            <div class="row">
                <div class="col-md-2 menu-icon">
                    <span class="material-symbols-rounded">${opt.icon}</span>
                </div>
                <div class="col-md-10 menu-text">${opt.label}</div>
            </div>
        </md-menu-item>
    `).join('');

    return `
        <div style="position: relative;" class="custom-select-container">
            <md-outlined-text-field
                id="${id}-trigger"
                class="auth-field select-trigger"
                label="${label}"
                readonly
                ${required ? 'required' : ''}
            >
                <md-icon slot="trailing-icon" class="material-symbols-rounded">arrow_drop_down</md-icon>
            </md-outlined-text-field>
            <md-menu id="${id}-menu" anchor="${id}-trigger">
                ${optionItems}
            </md-menu>
            <input type="hidden" id="${id}" value="">
        </div>
    `;
}

/**
 * Initialize custom select listeners
 * 
 * @param {HTMLElement} root - Root container
 * @param {string} id - Component ID
 */
export function initCustomSelect(root, id) {
    const trigger = root.querySelector(`#${id}-trigger`);
    const menu = root.querySelector(`#${id}-menu`);
    const hiddenInput = root.querySelector(`#${id}`);

    if (!trigger || !menu || !hiddenInput) return;

    trigger.addEventListener("click", () => {
        menu.open = !menu.open;
    });

    menu.addEventListener("closed", (e) => {
        const item = e.target.selectedItem;
        if (item) {
            const value = item.value;
            const textElement = item.querySelector(".menu-text");
            const text = textElement ? textElement.textContent : value;
            
            trigger.value = text;
            hiddenInput.value = value;
            
            // Dispatch change event for hidden input if needed
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}
