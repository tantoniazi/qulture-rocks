# Demo data: one login user and a company whose hierarchy mirrors the challenge's organisation chart.
puts "Seeding demo data..."

User.find_or_create_by!(email: "admin@example.com") do |user|
  user.name = "Admin"
  user.password = "password123"
  user.password_confirmation = "password123"
end

company = Company.find_or_create_by!(name: "Qulture Rocks")

HIERARCHY = {
  "ceo"     => { name: "Ana Souza",     manager: nil },
  "cto"     => { name: "Bruno Lima",    manager: "ceo" },
  "coo"     => { name: "Carla Mendes",  manager: "ceo" },
  "dev1"    => { name: "Diego Rocha",   manager: "cto" },
  "dev2"    => { name: "Elisa Ramos",   manager: "cto" },
  "ops1"    => { name: "Felipe Costa",  manager: "coo" },
  "ops2"    => { name: "Gabriela Nunes", manager: "coo" },
  "qa1"     => { name: "Hugo Alves",    manager: "dev1" },
  "qa2"     => { name: "Iara Freitas",  manager: "dev2" }
}.freeze

employees = HIERARCHY.to_h do |key, data|
  email = "#{data[:name].parameterize}@qulture.example"
  employee = Employee.find_or_create_by!(company: company, email: email) { |e| e.name = data[:name] }
  [ key, employee ]
end

HIERARCHY.each do |key, data|
  next if data[:manager].nil?

  employees[key].update!(manager: employees[data[:manager]])
end

puts "Seeded #{Company.count} companies, #{Employee.count} employees, #{User.count} users."
