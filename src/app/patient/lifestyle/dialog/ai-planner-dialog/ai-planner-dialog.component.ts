import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AiService } from '@core/service/ai.service';
import { CommonModule } from '@angular/common';

interface MealPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

interface PlanResult {
  calories: string;
  macros: string;
  meals: MealPlan;
  habits: string[];
  groceryList: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ai-planner-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    MatDialogClose,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="addContainer" style="max-height: 90vh; overflow-y: auto;">
      <div class="modalHeader" style="background: linear-gradient(135deg, #a855f7, #6366f1); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: 6px; border-top-right-radius: 6px;">
        <div class="avatarDetails" style="display: flex; align-items: center; gap: 8px;">
          <mat-icon>auto_awesome</mat-icon>
          <div class="modalTitle" style="font-weight: 600; font-size: 1.15rem;">AI Diet & Habits Planner</div>
        </div>
        <button mat-icon-button mat-dialog-close class="modal-close-button" style="color: white; border: none; background: transparent;" aria-label="Close dialog" type="button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content style="padding: 20px;">
        <form [formGroup]="plannerForm" (ngSubmit)="generatePlan()" class="register-form">
          <div class="row">
            <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
              <mat-form-field class="example-full-width" appearance="outline">
                <mat-label>Wellness Goal</mat-label>
                <mat-select formControlName="goal" required>
                  <mat-option value="Weight Loss">Weight Loss</mat-option>
                  <mat-option value="Muscle Gain">Muscle Gain</mat-option>
                  <mat-option value="Cardiovascular Health">Heart Health</mat-option>
                  <mat-option value="Manage Diabetes">Manage Diabetes</mat-option>
                  <mat-option value="High Energy">High Energy</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
              <mat-form-field class="example-full-width" appearance="outline">
                <mat-label>Dietary Preference</mat-label>
                <mat-select formControlName="preference" required>
                  <mat-option value="Balanced">Balanced</mat-option>
                  <mat-option value="Vegetarian">Vegetarian</mat-option>
                  <mat-option value="Vegan">Vegan</mat-option>
                  <mat-option value="Keto">Keto</mat-option>
                  <mat-option value="Low-Carb">Low-Carb</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
          <div class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 mb-3">
              <mat-form-field class="example-full-width" appearance="outline">
                <mat-label>Target Daily Calories (Optional)</mat-label>
                <input matInput type="number" formControlName="calories" placeholder="e.g. 1800">
                <span matSuffix style="margin-right: 8px;">kcal</span>
              </mat-form-field>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-12 text-end">
              <button type="submit" mat-flat-button [disabled]="isGenerating() || !plannerForm.valid"
                style="background: linear-gradient(135deg, #a855f7, #6366f1); color: white; padding: 8px 20px; font-weight: 500; border-radius: 6px;">
                @if (isGenerating()) {
                  <mat-spinner diameter="16" style="margin-right: 8px; display: inline-block; vertical-align: middle;"></mat-spinner>
                  Creating Plan...
                } @else {
                  <ng-container>
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px; margin: 0; vertical-align: middle; margin-right: 5px;">auto_awesome</mat-icon>
                    Generate Plan
                  </ng-container>
                }
              </button>
            </div>
          </div>
        </form>

        @if (planResult(); as plan) {
          <div class="planner-results mt-4" style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <div class="row mb-3">
              <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-2">
                <div style="background: rgba(99, 102, 241, 0.05); padding: 12px; border-radius: 8px; border-left: 4px solid #6366f1;">
                  <strong style="color: #4f46e5; display: block; font-size: 0.85rem;">Estimated Daily Intake:</strong>
                  <span style="font-size: 1.1rem; font-weight: 600; color: #1e1b4b;">{{ plan.calories }}</span>
                </div>
              </div>
              <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-2">
                <div style="background: rgba(168, 85, 247, 0.05); padding: 12px; border-radius: 8px; border-left: 4px solid #a855f7;">
                  <strong style="color: #7c3aed; display: block; font-size: 0.85rem;">Nutrient Splits:</strong>
                  <span style="font-size: 0.95rem; font-weight: 500; color: #1e1b4b;">{{ plan.macros }}</span>
                </div>
              </div>
            </div>

            <!-- Meals Block -->
            <div class="card mb-3" style="border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: none;">
              <div style="background: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 6px;">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px; color: #6366f1;">restaurant</mat-icon> Personalized Nutrition Plan
              </div>
              <div style="padding: 15px;">
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <div style="font-size: 0.85rem; color: #a855f7; font-weight: 600;">Breakfast</div>
                    <div style="color: #334155; font-size: 0.9rem;">{{ plan.meals.breakfast }}</div>
                  </div>
                  <div class="col-md-6 mb-2">
                    <div style="font-size: 0.85rem; color: #a855f7; font-weight: 600;">Lunch</div>
                    <div style="color: #334155; font-size: 0.9rem;">{{ plan.meals.lunch }}</div>
                  </div>
                </div>
                <hr style="margin: 8px 0; border-color: #f1f5f9;">
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <div style="font-size: 0.85rem; color: #a855f7; font-weight: 600;">Dinner</div>
                    <div style="color: #334155; font-size: 0.9rem;">{{ plan.meals.dinner }}</div>
                  </div>
                  <div class="col-md-6 mb-2">
                    <div style="font-size: 0.85rem; color: #a855f7; font-weight: 600;">Snacks</div>
                    <div style="color: #334155; font-size: 0.9rem;">{{ plan.meals.snacks }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Habits Block -->
            <div class="card mb-3" style="border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: none;">
              <div style="background: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 6px;">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px; color: #10b981;">check_circle</mat-icon> AI Recommended Daily Habits
              </div>
              <div style="padding: 15px;">
                <ul style="list-style: none; padding-left: 0; margin-bottom: 0;">
                  @for (habit of plan.habits; track habit) {
                    <li style="display: flex; align-items: start; gap: 8px; font-size: 0.9rem; color: #334155; margin-bottom: 8px;">
                      <mat-icon style="color: #10b981; font-size: 16px; width: 16px; height: 16px; margin-top: 2px;">done</mat-icon>
                      <span>{{ habit }}</span>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <!-- Grocery List Block -->
            <div class="card mb-3" style="border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: none;">
              <div style="background: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 6px;">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px; color: #f59e0b;">shopping_cart</mat-icon> Smart Grocery List
              </div>
              <div style="padding: 15px;">
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  @for (item of plan.groceryList; track item) {
                    <span style="background: #f1f5f9; color: #475569; font-size: 0.85rem; padding: 4px 10px; border-radius: 15px; font-weight: 500;">
                      {{ item }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12 text-center mt-3">
                <button mat-flat-button mat-dialog-close
                  style="background: #64748b; color: white; padding: 6px 24px; border-radius: 6px;">
                  Save & Apply Plan
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class AiPlannerDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<AiPlannerDialogComponent>>(MatDialogRef);
  private fb = inject(FormBuilder);
  private aiService = inject(AiService);
  private snackBar = inject(MatSnackBar);

  plannerForm!: FormGroup;
  isGenerating = signal<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  planResult = signal<PlanResult>(null as any);

  ngOnInit() {
    this.plannerForm = this.fb.group({
      goal: ['Weight Loss', Validators.required],
      preference: ['Balanced', Validators.required],
      calories: ['']
    });

    const savedPlan = localStorage.getItem('salvera_ai_diet_plan');
    if (savedPlan) {
      try {
        this.planResult.set(JSON.parse(savedPlan));
      } catch (_e) {}
    }
  }

  generatePlan() {
    if (!this.plannerForm.valid) return;

    this.isGenerating.set(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.planResult.set(null as any);

    const goal = this.plannerForm.get('goal')?.value;
    const pref = this.plannerForm.get('preference')?.value;
    const cal = this.plannerForm.get('calories')?.value;

    const prompt = `Act as an expert clinic nutritionist and healthy lifestyle architect. 
Generate a comprehensive Diet and Habit Plan based on these details:
- Wellness Goal: ${goal}
- Dietary Preference: ${pref}
${cal ? `- Daily Calorie Target: ${cal} kcal` : ''}

Provide a structured response strictly matching this JSON schema:
{
  "calories": "Daily caloric intake e.g. 1800 kcal",
  "macros": "Macro splits e.g. Carbs: 150g, Protein: 120g, Fat: 60g",
  "meals": {
    "breakfast": "Meal suggestion details",
    "lunch": "Meal suggestion details",
    "dinner": "Meal suggestion details",
    "snacks": "Meal suggestion details"
  },
  "habits": [
    "Habit limit/instruction 1",
    "Habit limit/instruction 2",
    "Habit limit/instruction 3",
    "Habit limit/instruction 4"
  ],
  "groceryList": [
    "Ingredient 1",
    "Ingredient 2",
    "Ingredient 3"
  ]
}

No other text or markup. Return raw JSON.`;

    this.aiService.postPrompt(prompt).subscribe({
      next: (res: string) => {
        this.isGenerating.set(false);
        try {
          if (res.includes('[DEMO MODE]')) {
            const mockData = {
              calories: cal ? `${cal} kcal` : '1850 kcal',
              macros: 'Carbs: 160g, Protein: 110g, Fat: 55g',
              meals: {
                breakfast: `Oatmeal topped with walnuts, wild berries, and a drizzle of honey (${pref} option).`,
                lunch: `Fresh green salad bowl featuring avocado slices, toasted pumpkin seeds, and clean dressings (${pref} styled).`,
                dinner: `Baked protein portion served alongside roasted sweet potato chunks and steamed asparagus.`,
                snacks: `A handful of dry-roasted almonds, sliced apples, and freshly brewed organic green tea.`
              },
              habits: [
                'Drink at least 8 to 10 glasses (2.5 liters) of water daily.',
                'Engage in 20-30 minutes of aerobic exercise or brisk walking.',
                'Shut down screens 45 minutes before bedtime for high sleep hygiene.',
                'Limit processed snacks and replace with high-fiber fruits.'
              ],
              groceryList: ['Oatmeal', 'Walnuts', 'Mixed Berries', 'Avocado', 'Pumpkin Seeds', 'Sweet Potatoes', 'Asparagus', 'Almonds', 'Organic Green Tea']
            };
            this.planResult.set(mockData);
            localStorage.setItem('salvera_ai_diet_plan', JSON.stringify(mockData));
            this.snackBar.open('Diet & Habits plan generated (Demo Mode)!', 'Close', { duration: 3000 });
            return;
          }

          const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          this.planResult.set(parsed);
          localStorage.setItem('salvera_ai_diet_plan', JSON.stringify(parsed));
          this.snackBar.open('AI Diet & Habits Plan completed successfully!', 'Close', { duration: 3000, panelClass: 'snackbar-success' });
        } catch (_e) {
          this.snackBar.open('AI parsing error. Please try generating again.', 'Close', { duration: 3000 });
        }
      },
      error: () => {
        this.isGenerating.set(false);
        this.snackBar.open('AI planner failed. Check network settings.', 'Close', { duration: 3000 });
      }
    });
  }
}
