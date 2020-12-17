let main = {};
let arr = ['bitcoin-btc'];

let alerts_;

const loading = document.querySelector('#loading');
const options_container = document.querySelector('.options-container');

const radio_buttons = Array.from(document.querySelectorAll('.radio-wrapper input'));

const input = options_container.querySelector('.input-container input');
const ul = document.querySelector('.options-container-inner ul');

const overlay = document.querySelector('.overlay');

let li_id;
let target;
let index;

chrome.storage.local.get(['main', 'arr'], e => {
    try {
        if(e.main) {
            main = e.main
    
            if(e.arr) arr = e.arr;
            if(e.main.alerts) alerts_ = true;
    
            render_li_elements(main);
            
            if (main['link']) document.querySelector('.radio-wrapper #yes').checked = true;
            
            loading.style.display = 'none';
            options_container.style.display = 'block';
            
            conversion();
            filtering();
            
            add_event_listener_to_add_or_remove_selected_coins();
            add_event_listeners_to_radio_buttons();
            
            change_alert_option();
        }
        else{
            chrome.storage.onChanged.addListener(function(changes, namespace){
                location.reload();
            });
        }
    } catch (error) {
        console.log(error);
    }
});

function render_li_elements(e){
    try {
        // napravi dokument fragment
        let fragment = document.createDocumentFragment();

        var n = 0;
        
        e.coins
            .forEach(e => {
                n = n + 1;

                // napravi li element
                create_li(e, n, fragment);
            });
        
        // dodaj fragment na ul
        ul.appendChild(fragment);
    } catch (error) {
        console.log(error);
    }
}

function create_li(e, n, fragment){
    try {
        // napravi li element
        let li = document.createElement('li');
        li.id = e.name.toLowerCase().split(' ').join('-') + '-' + e.symbol.toLowerCase();
        li.className = 'coin';
        /*li.dataset.name = e.name;*/

        // napravi checkbox i dodaj ga na li
        let checkbox = document.createElement('input');
        checkbox.id = 'item' + n;
        checkbox.type = 'checkbox';
        checkbox.checked = arr.includes(e.name.toLowerCase().split(' ').join('-') + '-' + e.symbol.toLowerCase()) ? 'checked' : '';
        li.appendChild(checkbox);

        // napravi label i dodaj ga na li
        let label = document.createElement('label');
        label.htmlFor = 'item' + n;
        label.innerHTML = '<b>' + e.name + '</b>' + ' ' + e.symbol.toUpperCase();
        li.appendChild(label);

        // napravi div sa klasom more-options i dodaj ga na li
        let more_options = document.createElement('div');
        more_options.className = 'more-options';
        li.appendChild(more_options);

        // napravi img sa klasom bell i dodaj ga na more_options
        let bell = document.createElement('img');
        bell.className = 'bell';
        bell.dataset.id = e.id;
        more_options.appendChild(bell);

        // napravi div sa klasom set-alert i dodaj ga na more_options
        let set_alert = document.createElement('div');
        set_alert.className = 'set-alert';
        li.appendChild(set_alert);

        // napravi h3 id dodaj ga na set_alert
        let h3 = document.createElement('h3');
        h3.textContent = 'Set alert for ' + e.name;
        set_alert.appendChild(h3);

        // napravi div sa klasom currency-selection i dodaj ga na set_alert
        let currency_selection = document.createElement('div');
        currency_selection.className = 'currency-selection';
        set_alert.appendChild(currency_selection);

        // napravi span i dodaj ga na currency_selection
        let span = document.createElement('span');
        span.textContent = 'Select currency:';
        currency_selection.appendChild(span);

        // napravi select i dodaj ga na currency_selection
        let select = document.createElement('select');
        currency_selection.appendChild(select);

        // napravi dva option taga za btc i usd i dodaj ih na select
        let option_usd = document.createElement('option');
        option_usd.value = 'usd';
        option_usd.textContent = 'USD';
        select.appendChild(option_usd);

        if (e.name.toLowerCase() !== 'bitcoin') {
            let option_btc = document.createElement('option');
            option_btc.value = 'btc';
            option_btc.textContent = 'BTC';
            select.appendChild(option_btc);
        }

        // napravi div sa klasom define-alert i dodaj ga na set_alert
        let define_alert = document.createElement('div');
        define_alert.className = 'define-alert';
        set_alert.appendChild(define_alert);

        // napravi div sa klasom above-wrapper i dodaj ga na define_alert
        let above_wrapper = document.createElement('div');
        above_wrapper.className = 'above-wrapper';
        define_alert.appendChild(above_wrapper);

        // napravi span i dodaj ga na above_wrapper
        let span_above = document.createElement('span');
        span_above.textContent = 'Above:';
        above_wrapper.appendChild(span_above);

        // napravi input sa id above i dodaj ga na above_wrapper
        let input_above = document.createElement('input');
        input_above.id = 'above';
        above_wrapper.appendChild(input_above);

        // napravi div sa klasom below-wrapper i dodaj ga na define_alert
        let below_wrapper = document.createElement('div');
        below_wrapper.className = 'below-wrapper';
        define_alert.appendChild(below_wrapper);

        // napravi span i dodaj ga na below_wrapper
        let span_below = document.createElement('span');
        span_below.textContent = 'Below:';
        below_wrapper.appendChild(span_below);

        // napravi input sa id below i dodaj ga na below_wrapper
        let input_below = document.createElement('input');
        input_below.id = 'below';
        below_wrapper.appendChild(input_below);

        // napravi div sa klasum buttons i dodaj ga na define_alert
        let buttons = document.createElement('div');
        buttons.className = 'buttons';
        define_alert.appendChild(buttons);

        // napravi button sa id submit i dodaj ga na buttons
        let submit_button = document.createElement('button');
        submit_button.id = 'submit';
        submit_button.textContent = 'Submit';
        buttons.appendChild(submit_button);

        // napravi button sa id delete i dodaj ga na buttons
        let delete_button = document.createElement('button');
        delete_button.id = 'delete';
        delete_button.textContent = 'Close';
        buttons.appendChild(delete_button);

        if(alerts_){
            if(main.alerts[e.id.toLowerCase()]){
                delete_button.textContent = 'Delete';

                bell.src = '../img/bell_yellow.svg';
                bell.dataset.alert = 'true';

                input_above.value = main.alerts[e.id.toLowerCase()].max;
                input_below.value = main.alerts[e.id.toLowerCase()].min;
            }
            else{
                bell.src = '../img/bell.svg';
                bell.dataset.alert = '';
            }
        }
        else{
            bell.src = '../img/bell.svg';
            bell.dataset.alert = '';
        }

        bell.addEventListener('click', function(){
            overlay.style.display = 'block';
            bell.parentElement.nextElementSibling.style.display = 'block';
        })

        add_event_listener_to_alert_submit_button(bell, set_alert, submit_button, delete_button,select, input_above, input_below);
        add_event_listener_to_alert_delete_button(bell, set_alert, delete_button, select, input_above, input_below);

        // dodaj li na fragment
        fragment.appendChild(li);
    } catch (error) {
        console.log(error);
    }
}

function conversion() {
    try {
        let f_currency_tags = document.querySelectorAll('.convert span');

        if(main.convert){
            f_currency_tags.forEach(function(e){
                if(e.textContent == main.convert){
                    e.className = 'active';
                }
            });
        }

        f_currency_tags.forEach(function(e){
            e.addEventListener('click', function(){
                if(e.className == 'active'){
                    e.classList.toggle('active');
                }
                else{
                    f_currency_tags.forEach(function(e){
                        e.className = '';
                    });
                    e.className = 'active';
                }

                let selected =  document.querySelector('.convert span.active');
                main.convert = selected ? selected.textContent : false;

                change_alert_option();

                chrome.storage.local.set({convert: main.convert}, function(){
                    chrome.storage.local.set({main});
                });
            });
        });
    } catch (error) {
        console.log(error);
    }
}

function change_alert_option() {
    try {
        const all_options = Array.from(document.querySelectorAll('.currency-selection option'));

        const fiat_options = all_options.filter(option => option.value !== 'btc');

        const convert = main.convert;
        
        fiat_options.forEach(option => {
            if (main.convert) {
                option.value = convert.toLowerCase();
                option.textContent = convert.toUpperCase();
            } else {
                option.value = 'usd';
                option.textContent = 'USD';
            }
        });
    } catch (error) {
        console.log(error);
    }
}

function filtering(){
    try {
        input.addEventListener('keyup', function(){
            var input_value = input.value.toUpperCase();
            var li = ul.querySelectorAll('li');
    
            li.forEach(e => {
                li_id = e.id.toUpperCase().split('-').join(' ');
    
                if(!(li_id.startsWith(input_value) || li_id.slice(li_id.lastIndexOf(' ') + 1).startsWith(input_value))){
                    e.style.display = 'none';
                }
                else{
                    e.style.display = '';
                }
            });
        });
    } catch (error) {
        console.log(error);
    }
}

function add_event_listener_to_alert_submit_button(target, set_alert, submit_button, delete_button, select, above, below){
    try {
        let coin = target.dataset.id.toLowerCase();

        submit_button.addEventListener('click', function(){
            let select_value = select.options[select.selectedIndex].value;
            let above_value = above.value;
            let below_value = below.value;

            if(isNaN(above_value) || isNaN(below_value)){
                if(isNaN(above_value)) above.style.border = '2px solid red';
                if(isNaN(below_value)) below.style.border = '2px solid red';
                return false;
            }
            if(above_value == '' && below_value == ''){
                above.style.border = '2px solid red';
                below.style.border = '2px solid red';
                return false;
            }


            main['alerts'] = main['alerts'] || {};
            main['alerts'][coin] = main['alerts'][coin] || {};
            main['alerts'][coin].cur = select_value;
            main['alerts'][coin].max = parseFloat(above_value);
            main['alerts'][coin].min = parseFloat(below_value);
            
            chrome.storage.local.set({main}, function(){
                delete_button.textContent = 'Delete';
                overlay.style.display = 'none';
                set_alert.style.display = 'none';
                target.src = '../img/bell_yellow.svg';
                target.dataset.alert = 'true';
            });
        });
    } catch (error) {
        console.log(error);
    }
}

function add_event_listener_to_alert_delete_button(target, set_alert, delete_button, select, input_above, input_below){
    try {
        let coin = target.dataset.id.toLowerCase();

        delete_button.addEventListener('click', function(){
            if(alerts_){
                if(main.alerts[coin]){
                    delete main.alerts[coin];
                }
            }

            chrome.storage.local.set({main}, function(){
                overlay.style.display = 'none';
                set_alert.style.display = 'none';
                target.src = '../img/bell.svg';
                target.dataset.alert = '';
                input_above.value = '';
                input_below.value = '';
            });
        });
    } catch (error) {
        console.log(error);
    }
}

function add_event_listeners_to_radio_buttons() {
    try {
        radio_buttons.forEach(button => {
            button.addEventListener('click', function(){
                this.id === 'yes' ? main['link'] = true : main['link'] = false;
                chrome.storage.local.set({main});
            });
        });
    } catch (error) {
        console.log(error);
    }
}

function add_event_listener_to_add_or_remove_selected_coins(){
    try {
        options_container.addEventListener('click', function(e){
            target = e.target;
        
            if(!target.matches('input[type="checkbox"]')) return;
        
            index = arr.indexOf(target.parentElement.id);
            if(index != -1){
                arr.splice(index, 1);
                target.removeAttribute("checked");
            }
            else{
                arr.push(target.parentElement.id);
                target.setAttribute("checked", "checked");
            }
            chrome.storage.local.set({'arr': arr});
        });
    } catch (error) {
        console.log(error);
    }
}