// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { CoreReminderData, CoreReminders, CoreRemindersService } from '@features/reminders/services/reminders';
import { Component, Input } from '@angular/core';
import { CoreDomUtils } from '@services/utils/dom';
import { CoreRemindersSetReminderMenuComponent } from '../set-reminder-menu/set-reminder-menu';

/**
 * Component that displays a button to set a reminder.
 */
@Component({
    selector: 'core-reminders-set-button',
    templateUrl: 'set-button.html',
})
export class CoreRemindersSetButtonComponent {

    @Input() component?: string;
    @Input() instanceId?: number;
    @Input() type?: string;
    @Input() label = '';
    @Input() timebefore?: number;
    @Input() time = -1;
    @Input() title = '';
    @Input() url = '';

    /**
     * Set reminder.
     *
     * @param ev Click event.
     */
    async setReminder(ev: Event): Promise<void> {
        if (this.component === undefined || this.instanceId === undefined || this.type === undefined) {
            return;
        }

        ev.preventDefault();
        ev.stopPropagation();

        if (this.timebefore === undefined) {
            // Set it to the time of the event.
            this.saveReminder(0);

            return;
        }

        // Open popover.
        const reminderTime = await CoreDomUtils.openPopover<{timeBefore: number}>({
            component: CoreRemindersSetReminderMenuComponent,
            componentProps: {
                initialValue: this.timebefore,
                noReminderLabel: 'core.reminders.delete',
            },
            event: ev,
        });

        if (reminderTime === undefined) {
            // User canceled.
            return;
        }

        // Save before.
        this.saveReminder(reminderTime.timeBefore);
    }

    /**
     * Save reminder.
     *
     * @param timebefore Time before the event to fire the notification.
     * @return Promise resolved when done.
     */
    protected async saveReminder(timebefore: number): Promise<void> {
        if (this.component === undefined || this.instanceId === undefined || this.type === undefined) {
            return;
        }

        if (timebefore === CoreRemindersService.DISABLED) {
            // Remove the reminder.
            await CoreReminders.removeReminders({
                instanceId: this.instanceId,
                component: this.component,
                type: this.type,
            });
            this.timebefore = undefined;

            return;
        }

        this.timebefore = timebefore;

        const reminder: CoreReminderData = {
            component: this.component,
            instanceId: this.instanceId,
            timebefore: this.timebefore,
            type: this.type,
            title: this.label + ' ' + this.title,
            url: this.url,
            time: this.time,
        };

        // Save before.
        await CoreReminders.addReminder(reminder);
    }

}
