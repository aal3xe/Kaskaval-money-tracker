export const KOTLIN_ARCHITECTURE_FILES: Record<string, { path: string; description: string; code: string }> = {
  Entity: {
    path: 'app/src/main/java/com/moneytracker/data/local/entity/TransactionEntity.kt',
    description: 'Room Database Entity defining database table and primary keys',
    code: `package com.moneytracker.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ColumnInfo

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    @ColumnInfo(name = "title") val title: String,
    @ColumnInfo(name = "amount") val amount: Double,
    @ColumnInfo(name = "type") val type: String, // "expense" | "income"
    @ColumnInfo(name = "category_id") val categoryId: String,
    @ColumnInfo(name = "category_name") val categoryName: String,
    @ColumnInfo(name = "category_icon") val categoryIcon: String,
    @ColumnInfo(name = "category_color") val categoryColor: String,
    @ColumnInfo(name = "timestamp") val timestamp: Long,
    @ColumnInfo(name = "note") val note: String?,
    @ColumnInfo(name = "payment_method") val paymentMethod: String,
    @ColumnInfo(name = "synced_to_cloud") val syncedToCloud: Boolean = false
)`
  },
  Dao: {
    path: 'app/src/main/java/com/moneytracker/data/local/dao/TransactionDao.kt',
    description: 'Room DAO providing reactive Flow streams and suspend CRUD methods',
    code: `package com.moneytracker.data.local.dao

import androidx.room.*
import com.moneytracker.data.local.entity.TransactionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY timestamp DESC")
    fun getAllTransactionsFlow(): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE user_id = :userId ORDER BY timestamp DESC")
    fun getTransactionsByUser(userId: String): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE id = :id")
    suspend fun getTransactionById(id: String): TransactionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(transactions: List<TransactionEntity>)

    @Delete
    suspend fun deleteTransaction(transaction: TransactionEntity)

    @Query("DELETE FROM transactions WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("SELECT * FROM transactions WHERE synced_to_cloud = 0")
    suspend fun getPendingSyncTransactions(): List<TransactionEntity>
}`
  },
  Database: {
    path: 'app/src/main/java/com/moneytracker/data/local/MoneyTrackerDatabase.kt',
    description: 'Room Database definition with RoomDatabase singleton configuration',
    code: `package com.moneytracker.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.moneytracker.data.local.dao.TransactionDao
import com.moneytracker.data.local.entity.TransactionEntity

@Database(
    entities = [TransactionEntity::class],
    version = 1,
    exportSchema = true
)
abstract class MoneyTrackerDatabase : RoomDatabase() {
    abstract val transactionDao: TransactionDao

    companion object {
        const val DATABASE_NAME = "money_tracker_db"
    }
}`
  },
  HiltModule: {
    path: 'app/src/main/java/com/moneytracker/di/AppModule.kt',
    description: 'Dagger Hilt Module providing Database, DAOs, and Firebase instances',
    code: `package com.moneytracker.di

import android.content.Context
import androidx.room.Room
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.moneytracker.data.local.MoneyTrackerDatabase
import com.moneytracker.data.local.dao.TransactionDao
import com.moneytracker.data.repository.MoneyRepositoryImpl
import com.moneytracker.domain.repository.MoneyRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): MoneyTrackerDatabase {
        return Room.databaseBuilder(
            context,
            MoneyTrackerDatabase::class.java,
            MoneyTrackerDatabase.DATABASE_NAME
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    @Singleton
    fun provideTransactionDao(db: MoneyTrackerDatabase): TransactionDao {
        return db.transactionDao
    }

    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth = FirebaseAuth.getInstance()

    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore = FirebaseFirestore.getInstance()

    @Provides
    @Singleton
    fun provideMoneyRepository(
        dao: TransactionDao,
        firestore: FirebaseFirestore,
        auth: FirebaseAuth
    ): MoneyRepository {
        return MoneyRepositoryImpl(dao, firestore, auth)
    }
}`
  },
  Repository: {
    path: 'app/src/main/java/com/moneytracker/data/repository/MoneyRepositoryImpl.kt',
    description: 'Offline-first repository syncing Room local persistence with Firebase Firestore',
    code: `package com.moneytracker.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.moneytracker.data.local.dao.TransactionDao
import com.moneytracker.data.local.entity.TransactionEntity
import com.moneytracker.domain.repository.MoneyRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

class MoneyRepositoryImpl @Inject constructor(
    private val dao: TransactionDao,
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth
) : MoneyRepository {

    override fun getTransactions(): Flow<List<TransactionEntity>> {
        return dao.getAllTransactionsFlow()
    }

    override suspend fun saveTransaction(tx: TransactionEntity) {
        // 1. Save to local Room DB immediately for 0-latency UI feedback
        dao.insertTransaction(tx)

        // 2. Synchronize to Firestore if user is authenticated
        val currentUser = auth.currentUser
        if (currentUser != null) {
            try {
                firestore.collection("users")
                    .document(currentUser.uid)
                    .collection("transactions")
                    .document(tx.id)
                    .set(tx)
                    .await()
                
                // Update local status as synced
                dao.insertTransaction(tx.copy(syncedToCloud = true))
            } catch (e: Exception) {
                // Offline fallback retains syncedToCloud = false for next background sync
            }
        }
    }

    override suspend fun deleteTransaction(id: String) {
        dao.deleteById(id)
        val uid = auth.currentUser?.uid
        if (uid != null) {
            firestore.collection("users")
                .document(uid)
                .collection("transactions")
                .document(id)
                .delete()
        }
    }
}`
  },
  ViewModel: {
    path: 'app/src/main/java/com/moneytracker/ui/MoneyViewModel.kt',
    description: 'Jetpack Compose StateFlow ViewModel injected with @HiltViewModel',
    code: `package com.moneytracker.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.moneytracker.domain.model.Transaction
import com.moneytracker.domain.repository.MoneyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MoneyUiState(
    val transactions: List<Transaction> = emptyList(),
    val totalBalance: Double = 0.0,
    val monthlyIncome: Double = 0.0,
    val monthlyExpenses: Double = 0.0,
    val isSyncing: Boolean = false,
    val selectedFilter: String = "All"
)

@HiltViewModel
class MoneyViewModel @Inject constructor(
    private val repository: MoneyRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MoneyUiState())
    val uiState: StateFlow<MoneyUiState> = _uiState.asStateFlow()

    init {
        observeTransactions()
    }

    private fun observeTransactions() {
        viewModelScope.launch {
            repository.getTransactions().collect { list ->
                val income = list.filter { it.type == "income" }.sumOf { it.amount }
                val expenses = list.filter { it.type == "expense" }.sumOf { it.amount }
                _uiState.update {
                    it.copy(
                        transactions = list,
                        monthlyIncome = income,
                        monthlyExpenses = expenses,
                        totalBalance = income - expenses
                    )
                }
            }
        }
    }

    fun addTransaction(tx: Transaction) {
        viewModelScope.launch {
            repository.saveTransaction(tx)
        }
    }
}`
  },
  ComposeScreen: {
    path: 'app/src/main/java/com/moneytracker/ui/screens/DashboardScreen.kt',
    description: 'Jetpack Compose UI Screen implementing Material 3 declarative components',
    code: `package com.moneytracker.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.moneytracker.ui.MoneyViewModel

@Composable
fun DashboardScreen(
    viewModel: MoneyViewModel = hiltViewModel(),
    onNavigateToAdd: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Money Tracker") })
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onNavigateToAdd) {
                Icon(Icons.Default.Add, contentDescription = "Add Expense")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(16.dp)
        ) {
            BalanceCard(
                balance = uiState.totalBalance,
                income = uiState.monthlyIncome,
                expenses = uiState.monthlyExpenses
            )
            Spacer(modifier = Modifier.height(16.dp))
            FinancialChartsSection(transactions = uiState.transactions)
            Spacer(modifier = Modifier.height(16.dp))
            RecentTransactionsList(transactions = uiState.transactions)
        }
    }
}`
  }
};
