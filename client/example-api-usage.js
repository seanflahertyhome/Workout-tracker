// Simple client snippet to POST a workout to the new API
// Adjust API_BASE to your server URL (e.g. '/' if you host server and PWA together)
const API_BASE = window.API_BASE || 'http://localhost:3000';

async function saveWorkout(workout) {
  const resp = await fetch(`${API_BASE}/api/workouts`, {
      method: 'POST',
          headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(workout)
                });
                  if (!resp.ok) {
                      const body = await resp.json().catch(()=>({}));
                          throw new Error('Failed to save workout: ' + (body.error || resp.status));
                            }
                              return resp.json();
                              }

                              // Example usage:
                              const sample = {
                                date: new Date().toISOString(),
                                  type: 'Run',
                                    duration: 3600,
                                      distance: 10.5,
                                        calories: 650,
                                          notes: 'Morning run',
                                            metadata: { source: 'PWA-v1' },
                                              exercises: []
                                              };

                                              saveWorkout(sample).then(result => {
                                                console.log('Saved workout id', result.id);
                                                }).catch(err => console.error(err));