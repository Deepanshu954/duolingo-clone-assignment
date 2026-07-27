import sqlite3
import json
import os

conn = sqlite3.connect('backend/db/duolingo.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

data = {}

courses = cursor.execute("SELECT id, language FROM courses").fetchall()
for course in courses:
    course_id = course["id"]
    data[course_id] = {}
    
    units = cursor.execute("SELECT id FROM units WHERE course_id = ?", (course_id,)).fetchall()
    for unit in units:
        unit_id = unit["id"]
        
        skills = cursor.execute("SELECT id FROM skills WHERE unit_id = ?", (unit_id,)).fetchall()
        for skill in skills:
            skill_id = skill["id"]
            
            lessons = cursor.execute("SELECT id FROM lessons WHERE skill_id = ?", (skill_id,)).fetchall()
            for lesson in lessons:
                lesson_id = lesson["id"]
                
                exercises = cursor.execute("SELECT * FROM exercises WHERE lesson_id = ? ORDER BY `order`", (lesson_id,)).fetchall()
                ex_list = []
                for ex in exercises:
                    ex_dict = dict(ex)
                    for key in ['options', 'sentence_parts', 'image_options', 'pairs']:
                        if key in ex_dict and ex_dict[key]:
                            try:
                                ex_dict[key] = json.loads(ex_dict[key])
                            except:
                                pass
                    ex_list.append(ex_dict)
                
                data[course_id][lesson_id] = ex_list

os.makedirs('frontend/public', exist_ok=True)
with open('frontend/public/curriculum.json', 'w') as f:
    json.dump(data, f)
print("Dumped to frontend/public/curriculum.json")
