import mysql.connector
from config import DatabaseConfig, OllamaConfig
from cv_Processor import CVProcessor

def connect_to_db(db_config):
    return mysql.connector.connect(
        host=db_config.host,
        user=db_config.user,
        password=db_config.password,
        database=db_config.database
    )

def main():
    print("🚀 AutoScreen CV Processor")
    print("=" * 50)

    db_config = DatabaseConfig.from_env()
    ollama_config = OllamaConfig.from_env()

    try:
        db_connection = connect_to_db(db_config)
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return

    file_path = input("Enter path to .pdf or .docx CV file: ").strip()

    processor = CVProcessor(model=ollama_config.model, db_connection=db_connection)
    success = processor.process(file_path)

    if success:
        print("\n✅ Process complete. Structured data inserted.")
    else:
        print("\n❌ CV processing failed.")

    db_connection.close()

if __name__ == "__main__":
    main()
