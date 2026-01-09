

INSERT INTO team_members (name, position, qualification, image_url, order_index)
VALUES 
  (
    'Njong Nya Nadia Keng',
    'CTO',
    'MTech Renewable Energy Engineering, BTech Electrical and Electronics, Trained Technician',
    'T1.jpg',
    1
  ),
  (
    'Yasin Sidik Nkwankwa',
    'Chief Operation Officer',
    'PhD Electrical Power Systems',
    'T2.jpeg',
    2
  ),
  (
    'Njong Nya Malaica Etaka',
    'CEO',
    'DIPET II Information and Communication Technology, Public Health Administrator',
    'T3.jpg',
    3
  ),
  (
    'Ashu Diane Enow',
    'CFO',
    'MBA in Finance',
    'T4.jpeg',
    4
  )
ON CONFLICT DO NOTHING;
