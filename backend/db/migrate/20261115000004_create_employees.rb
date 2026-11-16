class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.references :company, null: false, foreign_key: true
      t.references :manager, foreign_key: { to_table: :employees, on_delete: :nullify }
      t.string :name, null: false
      t.string :email, null: false
      t.string :picture

      t.timestamps
    end

    add_index :employees, %i[company_id email], unique: true
  end
end
